"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { AgentArchitectureDiagram } from "@/components/AgentArchitectureDiagram";
import { AGENTS } from "@/lib/agents";

const STEPS = [
  {
    num: "01",
    title: "VERIFY",
    line1: "Each agent authenticates via Terminal 3",
    line2: "DID bound to wallet before escrow opens",
    delay: "0.1s",
  },
  {
    num: "02",
    title: "ESCROW",
    line1: "0G locked per specialist on Galileo",
    line2: "Smart contract holds funds until completion",
    delay: "0.25s",
  },
  {
    num: "03",
    title: "EXECUTE",
    line1: "Research → Analysis → Writer pipeline",
    line2: "Sequential output passed between agents",
    delay: "0.4s",
  },
  {
    num: "04",
    title: "SETTLE",
    line1: "Task marked complete on-chain",
    line2: "Payment released to verified agent wallet",
    delay: "0.55s",
  },
];

const HEADLINES = [
  "Hire agents.",
  "Verify identity.",
  "Pay on-chain.",
  "Settle trustlessly.",
];

const STATS = [
  { label: "Specialist agents", value: "3" },
  { label: "TEE identity checks", value: "Per hire" },
  { label: "Settlement network", value: "0G Galileo" },
  { label: "Escrow model", value: "Per-task" },
];

export function LandingPage() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setHeadlineIndex((i) => (i + 1) % HEADLINES.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col overflow-hidden border-b border-line">
        <div className="grid-bg" />
        <div className="hero-glow" />
        <div className="scan-line" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="floating-node"
              style={{
                left: `${8 + i * 12}%`,
                top: `${14 + (i % 4) * 18}%`,
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${4.5 + i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <nav className="landing-fade-in relative z-10 flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="logo-pulse h-2 w-2 rounded-full bg-cyan" />
            <span className="font-display text-lg font-semibold tracking-tight">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="hidden border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-cyan hover:text-cyan sm:block"
            >
              Docs
            </Link>
            <Link
              href="/app"
              className="hidden border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-cyan hover:text-cyan sm:block"
            >
              Enter App
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <p
            className="landing-fade-in mb-5 font-mono text-xs tracking-[0.25em] text-cyan"
            style={{ animationDelay: "0.15s" }}
          >
            {APP_TAGLINE.toUpperCase()}
          </p>

          <h1 className="font-display text-5xl font-bold leading-[1.1] sm:text-6xl md:text-7xl">
            <span className="landing-fade-in block" style={{ animationDelay: "0.3s" }}>
              Hire agents.
            </span>
            <span className="landing-fade-in block" style={{ animationDelay: "0.45s" }}>
              Verify identity.
            </span>
            <span
              className={`headline-cycle block transition-all duration-300 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {HEADLINES[headlineIndex] === "Pay on-chain." ? (
                <>
                  Pay <span className="text-cyan text-glow">on-chain</span>.
                </>
              ) : (
                <span className="text-cyan text-glow">{HEADLINES[headlineIndex]}</span>
              )}
            </span>
          </h1>

          <p
            className="landing-fade-in mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base"
            style={{ animationDelay: "0.7s" }}
          >
            {APP_NAME} is a mission-control interface for autonomous agent swarms. Submit a goal,
            and a coordinated pipeline of T3N-verified specialists researches, analyses, and
            writes — with every hire escrowed and settled trustlessly on the 0G network.
          </p>

          <p
            className="landing-fade-in mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted/80"
            style={{ animationDelay: "0.8s" }}
          >
            No middlemen. No blind trust. Every agent proves identity in a TEE, every payment
            locks on-chain, every handoff is auditable.
          </p>

          <div
            className="landing-fade-in mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
            style={{ animationDelay: "0.9s" }}
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="border border-line bg-surface/40 px-3 py-3 text-center"
              >
                <p className="font-display text-lg font-bold text-cyan">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="landing-fade-in mt-8 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-muted"
            style={{ animationDelay: "1s" }}
          >
            <span className="badge-glow flex items-center gap-2 rounded-full border border-line px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
              0G GALILEO TESTNET
            </span>
            <span className="badge-glow flex items-center gap-2 rounded-full border border-line px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              TERMINAL 3 VERIFIED
            </span>
            <span className="badge-glow flex items-center gap-2 rounded-full border border-line px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              PER-TASK ESCROW
            </span>
          </div>

          <Link
            href="/app"
            className="cta-shimmer landing-fade-in mt-10 bg-cyan px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-bg transition-transform hover:scale-[1.03] hover:bg-cyan/90 active:scale-[0.98]"
            style={{ animationDelay: "1.1s" }}
          >
            Launch Mission Control
          </Link>
        </div>

        <div
          className="landing-fade-in relative z-10 flex justify-center pb-8"
          style={{ animationDelay: "1.3s" }}
        >
          <span className="scroll-hint font-mono text-sm text-muted">↓</span>
        </div>
      </section>

      {/* Animated architecture */}
      <AgentArchitectureDiagram />

      {/* Agent roster */}
      <section className="border-b border-line px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Agent Roster</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Three specialists, one mission
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Each agent owns a distinct role in the pipeline. They never run in parallel — output
            flows forward, escrow opens per hire, and settlement happens only after verified
            completion.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.roleKey}
                className="roster-card group relative overflow-hidden border border-line bg-surface/30 p-6"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="roster-scan pointer-events-none absolute inset-0" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
                  Agent {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{agent.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{agent.role}</p>
                <p className="mt-4 break-all font-mono text-[10px] text-muted/70">{agent.did}</p>
                <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan roster-dot" />
                  Standby
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden border-b border-line px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgb(var(--color-cyan)/0.06),transparent)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Protocol Flow</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            From goal submission to on-chain settlement, every step is deterministic. You remain
            the orchestrator — agents do the work, the contract holds the funds.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="step-card landing-fade-in group flex flex-col gap-2 border border-line bg-surface/40 px-6 py-6 transition-colors hover:border-cyan/40"
                style={{ animationDelay: step.delay }}
              >
                <p className="font-mono text-xs text-cyan">
                  [{step.num}]{" "}
                  <span className="text-ink transition-colors group-hover:text-cyan">
                    {step.title}
                  </span>
                </p>
                <p className="text-xs leading-relaxed text-muted transition-colors group-hover:text-ink/80">
                  {step.line1}
                </p>
                <p className="text-xs leading-relaxed text-muted">{step.line2}</p>
                <div className="mt-2 h-px w-0 bg-cyan transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="hero-glow opacity-60" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Ready to deploy</p>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Spin up your first agent mission
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Connect your wallet on 0G Galileo, define a goal, and watch the specialist pipeline
            verify, execute, and settle — all from mission control.
          </p>
          <Link
            href="/app"
            className="cta-shimmer mt-8 inline-block bg-cyan px-10 py-3 font-display text-sm font-bold uppercase tracking-wider text-bg transition-transform hover:scale-[1.03] hover:bg-cyan/90"
          >
            Open Mission Control
          </Link>
        </div>
      </section>
    </div>
  );
}
