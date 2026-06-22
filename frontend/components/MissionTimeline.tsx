"use client";

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
  agent: { name: string; roleKey: string };
  status: AgentStatus;
  did?: string;
  txHash?: string;
  taskId?: number;
  output?: string;
};

function failedStepIndex(task: AgentTask): number {
  if (!task.did) return 0;
  if (!task.txHash) return 1;
  if (task.taskId === undefined) return 2;
  if (!task.output) return 3;
  return 4;
}

const AGENT_STEPS = [
  { key: "verify", label: "Verify", detail: "T3N identity check" },
  { key: "escrow-sign", label: "Escrow", detail: "Sign in wallet" },
  { key: "escrow-confirm", label: "Confirm", detail: "On-chain lock" },
  { key: "execute", label: "Execute", detail: "Agent runs task" },
  { key: "settle", label: "Settle", detail: "Mark complete" },
] as const;

const STATUS_STEP_INDEX: Record<AgentStatus, number> = {
  pending: -1,
  verifying: 0,
  "hiring-sign": 1,
  "hiring-confirm": 2,
  executing: 3,
  settling: 4,
  complete: 5,
  error: -2,
};

function activeAgentIndex(tasks: AgentTask[]): number {
  const inProgress = tasks.findIndex((t) =>
    ["verifying", "hiring-sign", "hiring-confirm", "executing", "settling", "error"].includes(
      t.status
    )
  );
  if (inProgress >= 0) return inProgress;

  const firstIncomplete = tasks.findIndex((t) => t.status !== "complete");
  if (firstIncomplete >= 0) return firstIncomplete;

  return tasks.length > 0 ? tasks.length - 1 : 0;
}

function stepState(
  agentIndex: number,
  stepIndex: number,
  activeIndex: number,
  task: AgentTask
): "done" | "active" | "pending" | "error" {
  if (task.status === "error") {
    if (agentIndex < activeIndex) return "done";
    if (agentIndex > activeIndex) return "pending";
    const failedAt = failedStepIndex(task);
    if (stepIndex < failedAt) return "done";
    if (stepIndex === failedAt) return "error";
    return "pending";
  }

  if (agentIndex < activeIndex || task.status === "complete") return "done";
  if (agentIndex > activeIndex) return "pending";

  const current = STATUS_STEP_INDEX[task.status];
  if (current < 0) return "pending";
  if (stepIndex < current) return "done";
  if (stepIndex === current) return "active";
  return "pending";
}

function currentStepLabel(task: AgentTask): string {
  switch (task.status) {
    case "verifying":
      return "Verifying agent identity via Terminal 3";
    case "hiring-sign":
      return "Approve escrow transaction in your wallet";
    case "hiring-confirm":
      return "Waiting for on-chain confirmation on 0G Galileo";
    case "executing":
      return `Running ${task.agent.roleKey} agent via Groq`;
    case "settling":
      return "Marking task complete on-chain";
    case "complete":
      return "Agent finished — moving to next specialist";
    case "error":
      return "Step failed — pipeline halted";
    default:
      return "Standing by";
  }
}

type MissionTimelineProps = {
  tasks: AgentTask[];
  isPlanning: boolean;
  goal: string;
};

export function MissionTimeline({ tasks, isPlanning, goal }: MissionTimelineProps) {
  if (tasks.length === 0 && !isPlanning) return null;

  const activeIndex = activeAgentIndex(tasks);
  const activeTask = tasks[activeIndex];
  const allComplete = tasks.length > 0 && tasks.every((t) => t.status === "complete");
  const completedAgents = tasks.filter((t) => t.status === "complete").length;

  return (
    <div className="border border-line bg-surface/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
            Mission Timeline
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            {isPlanning
              ? "Planning specialist pipeline..."
              : allComplete
                ? "All agents complete — mission succeeded"
                : activeTask
                  ? currentStepLabel(activeTask)
                  : "Pipeline ready"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Progress</p>
          <p className="font-display text-lg font-bold text-cyan">
            {allComplete ? "100%" : `${Math.round((completedAgents / tasks.length) * 100)}%`}
          </p>
        </div>
      </div>

      {goal && (
        <p className="mt-3 truncate font-mono text-[11px] text-muted">
          <span className="text-cyan">&gt;</span> {goal}
        </p>
      )}

      {/* Agent track */}
      <div className="mt-6 flex items-center gap-1">
        {tasks.map((task, i) => {
          const isActive = i === activeIndex && !allComplete && !isPlanning;
          const isDone = task.status === "complete";
          const isFailed = task.status === "error";
          const isLast = i === tasks.length - 1;

          return (
            <div key={task.agent.roleKey} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                    isFailed
                      ? "border-danger bg-danger/10 text-danger"
                      : isDone
                        ? "border-success bg-success/10 text-success"
                        : isActive
                          ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_12px_rgb(var(--color-cyan)/0.35)]"
                          : "border-line bg-bg text-muted"
                  }`}
                >
                  {isDone ? "✓" : isFailed ? "!" : `0${i + 1}`}
                </div>
                <p
                  className={`truncate text-center font-mono text-[9px] uppercase tracking-wide ${
                    isActive ? "text-cyan" : isDone ? "text-success" : isFailed ? "text-danger" : "text-muted"
                  }`}
                >
                  {task.agent.roleKey}
                </p>
              </div>
              {!isLast && (
                <div
                  className={`mb-5 h-px flex-1 ${
                    isDone ? "bg-success/60" : isActive ? "bg-cyan/40" : "bg-line"
                  }`}
                />
              )}
            </div>
          );
        })}
        <div className="flex shrink-0 flex-col items-center gap-2 pl-1">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[10px] ${
              allComplete
                ? "border-success bg-success/10 text-success"
                : "border-line bg-bg text-muted"
            }`}
          >
            {allComplete ? "✓" : "◎"}
          </div>
          <p
            className={`font-mono text-[9px] uppercase tracking-wide ${
              allComplete ? "text-success" : "text-muted"
            }`}
          >
            Report
          </p>
        </div>
      </div>

      {/* Current agent micro-steps */}
      {activeTask && !allComplete && !isPlanning && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-wide text-muted">
            {activeTask.agent.name} — step {Math.min(STATUS_STEP_INDEX[activeTask.status] + 1, 5)} of 5
          </p>
          <ol className="flex flex-col gap-0 sm:flex-row sm:gap-0">
            {AGENT_STEPS.map((step, stepIndex) => {
              const state = stepState(activeIndex, stepIndex, activeIndex, activeTask);
              const isLast = stepIndex === AGENT_STEPS.length - 1;

              return (
                <li key={step.key} className="flex min-w-0 flex-1 items-start sm:items-center">
                  <div className="flex w-full min-w-0 items-start gap-3 sm:flex-col sm:items-center sm:gap-2">
                    <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                      <span
                        className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border sm:mt-0 ${
                          state === "done"
                            ? "border-success bg-success text-bg"
                            : state === "active"
                              ? "border-cyan bg-cyan text-bg animate-pulse"
                              : state === "error"
                                ? "border-danger bg-danger text-bg"
                                : "border-line bg-bg"
                        }`}
                      >
                        {state === "done" ? (
                          <span className="text-[10px] font-bold">✓</span>
                        ) : state === "active" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-bg" />
                        ) : state === "error" ? (
                          <span className="text-[10px] font-bold">!</span>
                        ) : (
                          <span className="h-1 w-1 rounded-full bg-muted" />
                        )}
                      </span>
                      <div className="min-w-0 sm:text-center">
                        <p
                          className={`font-mono text-[10px] uppercase tracking-wide ${
                            state === "active"
                              ? "text-cyan"
                              : state === "done"
                                ? "text-success"
                                : state === "error"
                                  ? "text-danger"
                                  : "text-muted"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="mt-0.5 hidden text-[10px] text-muted sm:block">{step.detail}</p>
                      </div>
                    </div>
                    {!isLast && (
                      <div
                        className={`hidden h-px flex-1 sm:block ${
                          state === "done" ? "bg-success/50" : "bg-line"
                        }`}
                      />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`ml-2.5 h-6 w-px shrink-0 sm:hidden ${
                        state === "done" ? "bg-success/50" : "bg-line"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isPlanning && (
        <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" />
          <p className="font-mono text-xs text-muted">Assigning research, analysis, and writer agents...</p>
        </div>
      )}
    </div>
  );
}
