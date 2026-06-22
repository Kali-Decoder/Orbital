"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useWriteContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { parseEther } from "viem";
import { ESCROW_ABI, ESCROW_ADDRESS, ESCROW_AMOUNT_PER_TASK_OG } from "@/lib/contract";
import { AGENTS } from "@/lib/agents";
import { txExplorerUrl } from "@/lib/chain";
import { waitForGalileoReceipt } from "@/lib/wait-for-receipt";
import { config } from "@/lib/wagmi";
import { MissionTimeline } from "@/components/MissionTimeline";
import { downloadReport, type ExportFormat } from "@/lib/export-report";
import { MissionInvoice } from "@/components/MissionInvoice";

type AgentStatus =
  | "pending"
  | "verifying"
  | "hiring-sign"
  | "hiring-confirm"
  | "executing"
  | "settling"
  | "complete"
  | "error";

type AgentTask = {
  agent: (typeof AGENTS)[number];
  subTask: string;
  did?: string;
  txHash?: `0x${string}`;
  taskId?: number;
  output?: string;
  status: AgentStatus;
  errorMessage?: string;
  markCompleteHash?: `0x${string}`;
  markCompleteError?: string;
  escrowAmountOg?: string;
};

// Mocked orchestrator logic: splits a goal into one sub-task per agent.
function planTasks(goal: string): AgentTask[] {
  return [
    {
      agent: AGENTS[0],
      subTask: `Research: Gather data and sources about "${goal}"`,
      status: "pending",
    },
    {
      agent: AGENTS[1],
      subTask: `Analyse: Extract key insights from research on "${goal}"`,
      status: "pending",
    },
    {
      agent: AGENTS[2],
      subTask: `Write: Produce a structured report on "${goal}"`,
      status: "pending",
    },
  ];
}

function readableError(error: unknown): string {
  if (error && typeof error === "object" && "shortMessage" in error) {
    return String((error as { shortMessage: unknown }).shortMessage);
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function shortenHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  pending: "STANDBY",
  verifying: "VERIFYING",
  "hiring-sign": "ESCROW",
  "hiring-confirm": "ESCROW",
  executing: "EXECUTING",
  settling: "SETTLING",
  complete: "COMPLETE",
  error: "FAILED",
};

// Bottom status bar groups the finer-grained states into the 5 colors the
// mission-control bar communicates: standby / processing / live / done / failed.
const STATUS_BAR: Record<AgentStatus, string> = {
  pending: "bg-muted/40",
  verifying: "bg-warning",
  "hiring-sign": "bg-warning",
  "hiring-confirm": "bg-warning",
  executing: "bg-cyan",
  settling: "bg-cyan",
  complete: "bg-success",
  error: "bg-danger",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  pending: "bg-muted",
  verifying: "bg-warning",
  "hiring-sign": "bg-warning",
  "hiring-confirm": "bg-warning",
  executing: "bg-cyan",
  settling: "bg-cyan",
  complete: "bg-success",
  error: "bg-danger",
};

const IN_PROGRESS: AgentStatus[] = [
  "verifying",
  "hiring-sign",
  "hiring-confirm",
  "executing",
  "settling",
];

export function GoalInput() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <span className="font-mono text-cyan">&gt;</span>
          <div className="h-5 flex-1 animate-pulse bg-surface/60" />
          <div className="h-9 w-24 animate-pulse bg-surface/60" />
        </div>
      </div>
    );
  }

  return <GoalInputInner />;
}

function GoalInputInner() {
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const { writeContractAsync } = useWriteContract();

  const allComplete = tasks.length > 0 && tasks.every((t) => t.status === "complete");

  // Fade the final report in a tick after the pipeline finishes, rather than
  // popping in instantly, so it reads as a distinct "reveal" moment.
  useEffect(() => {
    if (!allComplete) {
      setShowReport(false);
      return;
    }
    const id = setTimeout(() => setShowReport(true), 50);
    return () => clearTimeout(id);
  }, [allComplete]);

  function update(i: number, patch: Partial<AgentTask>) {
    setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  async function handleLaunch() {
    if (!goal.trim()) return;
    setIsPlanning(true);

    const planned = planTasks(goal);
    setTasks(planned);
    setIsPlanning(false);

    let previousOutput: string | undefined;

    for (let i = 0; i < planned.length; i++) {
      const task = planned[i];
      update(i, { status: "verifying" });

      try {
        // Step 1: verify this agent's identity via T3N before locking any funds
        const verifyRes = await fetch("/api/verify-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentAddress: task.agent.address }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error ?? "Verification failed");
        const did = verifyData.did as string;
        update(i, { did, status: "hiring-sign" });

        // Step 2: lock escrow for this specific verified agent
        const txHash = await writeContractAsync({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "createTask",
          args: [task.agent.address, did],
          value: parseEther(ESCROW_AMOUNT_PER_TASK_OG),
        });
        update(i, {
          txHash,
          status: "hiring-confirm",
          escrowAmountOg: ESCROW_AMOUNT_PER_TASK_OG,
        });

        await waitForGalileoReceipt(txHash);

        // Task IDs are 1-indexed and assigned sequentially, so the task we
        // just created is whatever taskCount() reads right after it lands.
        const taskCount = await readContract(config, {
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "taskCount",
        });
        const taskId = Number(taskCount);
        update(i, { taskId, status: "executing" });

        // Step 3: the agent actually does the work, via Groq
        const execRes = await fetch("/api/execute-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentRole: task.agent.roleKey, goal, previousOutput }),
        });
        const execData = await execRes.json();
        if (!execRes.ok) throw new Error(execData.error ?? "Agent execution failed");
        const output = execData.output as string;
        previousOutput = output;
        update(i, { output, status: "settling" });

        // Step 4: autonomously close out the task on-chain. A failure here
        // doesn't undo the agent's completed work, so it's reported inline
        // rather than flipping the whole card to an error state.
        try {
          const markHash = await writeContractAsync({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "markCompleted",
            args: [BigInt(taskId)],
          });
          update(i, { markCompleteHash: markHash, status: "complete" });
        } catch (markErr) {
          update(i, { markCompleteError: readableError(markErr), status: "complete" });
        }
      } catch (err) {
        update(i, { status: "error", errorMessage: readableError(err) });
        console.error(err);
        break; // later agents depend on this one's output, so stop here
      }
    }
  }

  async function handleExport(format: ExportFormat) {
    setExportingFormat(format);
    try {
      await downloadReport(format, goal, tasks, reportRef.current);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Command bar */}
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="font-mono text-cyan">&gt;</span>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter mission objective..."
          className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-muted focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
        />
        <button
          onClick={handleLaunch}
          disabled={isPlanning || !goal.trim()}
          className="bg-cyan px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-bg hover:bg-cyan/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isPlanning ? "PLANNING..." : "LAUNCH"}
        </button>
      </div>

      <MissionTimeline tasks={tasks} isPlanning={isPlanning} goal={goal} />

      {/* Agent pipeline */}
      {tasks.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            Agent Pipeline
          </p>
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
            {tasks.map((task, i) => {
              const pulsing = IN_PROGRESS.includes(task.status);
              return (
                <div key={i} className="flex flex-col bg-surface">
                  <div className="flex items-center justify-between border-b border-line px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[task.status]} ${
                          pulsing ? "animate-pulse" : ""
                        }`}
                      />
                      <span className="font-mono text-[11px] tracking-wide">
                        AGENT-0{i + 1} // {task.agent.roleKey.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
                      {STATUS_LABEL[task.status]}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-3">
                    <p className="text-[11px] text-muted">{task.agent.role}</p>

                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">DID</p>
                      {task.did ? (
                        <p className="break-all font-mono text-xs text-cyan">{task.did}</p>
                      ) : (
                        <p className="font-mono text-xs text-muted">UNVERIFIED</p>
                      )}
                    </div>

                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">TX</p>
                      {task.txHash ? (
                        <a
                          href={txExplorerUrl(task.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-success underline hover:text-success/80"
                        >
                          {shortenHash(task.txHash)}
                        </a>
                      ) : task.status === "hiring-sign" ? (
                        <p className="font-mono text-xs text-warning">CONFIRM IN METAMASK...</p>
                      ) : (
                        <p className="font-mono text-xs text-muted">PENDING</p>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                        OUTPUT
                      </p>
                      <div className="max-h-[180px] min-h-[80px] flex-1 overflow-y-auto border border-[#1C2A3A] bg-[#0a0f14] p-3 text-[11px] leading-relaxed">
                        {task.output && (
                          <div className="agent-output-content text-[11px]">
                            <ReactMarkdown>{task.output}</ReactMarkdown>
                          </div>
                        )}
                        {task.status === "executing" && (
                          <span className="cursor-blink font-mono text-cyan">█</span>
                        )}
                        {task.status === "settling" && (
                          <p className="font-mono text-xs text-cyan">SETTLING ON-CHAIN...</p>
                        )}
                        {!task.output && task.status !== "executing" && task.status !== "settling" && (
                          <span className="font-mono text-muted">—</span>
                        )}
                      </div>
                    </div>

                    {task.errorMessage && (
                      <p className="font-mono text-xs text-danger">{task.errorMessage}</p>
                    )}
                    {task.markCompleteError && (
                      <p className="font-mono text-xs text-danger">
                        MARK COMPLETE FAILED: {task.markCompleteError}
                      </p>
                    )}
                  </div>

                  <div className={`h-1 w-full ${STATUS_BAR[task.status]}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final report */}
      {allComplete && (
        <div
          ref={reportRef}
          className={`flex flex-col gap-4 border border-cyan/30 bg-surface p-5 transition-all duration-700 ${
            showReport ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <p className="font-mono text-xs text-cyan">// MISSION COMPLETE</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Export</p>
              {(["txt", "pdf", "png"] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={exportingFormat !== null}
                  className="border border-cyan px-3 py-1.5 font-mono text-xs uppercase text-cyan hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {exportingFormat === format ? "..." : format}
                </button>
              ))}
            </div>
          </div>
          <div className="border-b border-line pb-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Objective</p>
            <p className="mt-1 font-mono text-sm text-ink">{goal}</p>
            <p className="mt-2 font-mono text-[10px] text-muted">
              Generated {new Date().toLocaleString()}
            </p>
          </div>
          {tasks.map((t, i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 border-t border-line pt-3 first:border-t-0 first:pt-0"
            >
              <p className="font-display text-sm font-semibold text-ink">{t.agent.name}</p>
              <p className="break-all font-mono text-xs text-muted">{t.did}</p>
              <div className="agent-output-content text-[11px]">
                <ReactMarkdown>{t.output ?? ""}</ReactMarkdown>
              </div>
            </div>
          ))}
          <MissionInvoice tasks={tasks} />
        </div>
      )}
    </div>
  );
}
