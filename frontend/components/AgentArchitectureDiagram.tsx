"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS } from "@/lib/agents";

const PIPELINE = [
  {
    id: "orchestrator",
    label: "Orchestrator",
    role: "You",
    detail: "Defines the mission goal and funds the pipeline from your wallet.",
    color: "ink",
  },
  ...AGENTS.map((agent, i) => ({
    id: agent.roleKey,
    label: agent.name.replace(" Agent", ""),
    role: agent.roleKey.toUpperCase(),
    detail: agent.role,
    color: ["cyan", "warning", "success"][i],
  })),
];

const LAYERS = [
  {
    title: "Identity Layer",
    provider: "Terminal 3 TEE",
    body: "Every agent proves its DID inside a trusted execution environment before any funds move. No impersonation, no spoofed wallets — only cryptographically attested identities.",
  },
  {
    title: "Settlement Layer",
    provider: "0G Galileo Escrow",
    body: "Each specialist hire locks 0G in a smart contract tied to that agent's verified DID. Payment releases only after the task is marked complete on-chain.",
  },
  {
    title: "Execution Layer",
    provider: "LLM Agents",
    body: "Research, analysis, and writing agents run sequentially — each consuming the prior output, producing auditable work, and settling independently.",
  },
];

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function shortenDid(did: string) {
  return `${did.slice(0, 14)}…${did.slice(-6)}`;
}

export function AgentArchitectureDiagram() {
  const { ref, visible } = useReveal();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveStep((s) => (s + 1) % PIPELINE.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden border-b border-line px-6 py-20 transition-all duration-1000 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgb(var(--color-cyan)/0.05),transparent)]" />

      <div className="relative mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">System Architecture</p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Multi-agent pipeline, end to end
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {visible && (
            <span className="typewriter-text">
              Orbital coordinates a three-stage specialist swarm. You set the objective — agents
              verify, execute, and settle in a strict sequence with on-chain accountability at
              every handoff.
            </span>
          )}
        </p>

        {/* Pipeline diagram */}
        <div className="mt-14 overflow-x-auto pb-4">
          <div className="flex min-w-[720px] items-stretch gap-0">
            {PIPELINE.map((node, i) => {
              const isActive = activeStep === i;
              const isPast = activeStep > i;
              const agent = AGENTS[i - 1];

              return (
                <div key={node.id} className="flex flex-1 items-center">
                  <div
                    className={`agent-node relative flex flex-1 flex-col border bg-surface/60 p-4 transition-all duration-500 ${
                      isActive
                        ? "border-cyan shadow-[0_0_24px_rgb(var(--color-cyan)/0.2)]"
                        : isPast
                          ? "border-success/40"
                          : "border-line"
                    }`}
                  >
                    {isActive && <span className="agent-node-ring" />}

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isActive
                            ? "bg-cyan animate-pulse"
                            : isPast
                              ? "bg-success"
                              : "bg-muted/50"
                        }`}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        {node.role}
                      </span>
                    </div>

                    <p className="mt-2 font-display text-sm font-semibold text-ink">{node.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{node.detail}</p>

                    {agent && (
                      <p className="mt-3 break-all font-mono text-[10px] text-cyan/70">
                        {shortenDid(agent.did)}
                      </p>
                    )}

                    {isActive && (
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-cyan">
                        <span className="cursor-blink">▋</span> Processing
                      </p>
                    )}
                    {isPast && !isActive && (
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-success">
                        Complete
                      </p>
                    )}
                  </div>

                  {i < PIPELINE.length - 1 && (
                    <div className="pipeline-connector relative mx-1 flex w-10 shrink-0 items-center">
                      <div className="pipeline-track h-px w-full bg-line" />
                      <span
                        className={`data-packet absolute h-1.5 w-1.5 rounded-full bg-cyan ${
                          isActive ? "data-packet-run" : ""
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Escrow bridge */}
        <div
          className={`mt-6 border border-line bg-bg/80 p-5 transition-all duration-700 delay-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warning">
                Escrow Bridge
              </p>
              <p className="mt-1 text-sm text-ink">
                Each agent hire triggers a separate escrow lock on 0G Galileo
              </p>
            </div>
            <div className="flex gap-6 font-mono text-[10px] uppercase tracking-wide text-muted">
              <span className="flex items-center gap-2">
                <span className="escrow-pulse h-1.5 w-1.5 rounded-full bg-warning" />
                Lock
              </span>
              <span className="flex items-center gap-2">
                <span className="escrow-pulse h-1.5 w-1.5 rounded-full bg-cyan" style={{ animationDelay: "0.4s" }} />
                Execute
              </span>
              <span className="flex items-center gap-2">
                <span className="escrow-pulse h-1.5 w-1.5 rounded-full bg-success" style={{ animationDelay: "0.8s" }} />
                Release
              </span>
            </div>
          </div>
        </div>

        {/* Layer cards */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {LAYERS.map((layer, i) => (
            <div
              key={layer.title}
              className={`layer-card group border border-line bg-surface/30 p-5 transition-all duration-700 hover:border-cyan/50 hover:bg-surface/60 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${300 + i * 120}ms` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
                {layer.title}
              </p>
              <p className="mt-2 font-display text-sm font-semibold text-ink">{layer.provider}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{layer.body}</p>
              <div className="mt-4 h-px w-0 bg-cyan transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
