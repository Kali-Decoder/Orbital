import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { addressExplorerUrl } from "@/lib/chain";
import {
  API_ROUTES,
  CONTRACTS,
  DOCS_META,
  NETWORK,
  PRODUCT_STEPS,
} from "@/lib/docs";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">{children}</p>
  );
}

function CopyRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="border-b border-line px-4 py-3 last:border-b-0 sm:grid sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-all font-mono text-xs text-ink sm:mt-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan transition-colors hover:text-cyan/80"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function DocsPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <nav className="flex items-center justify-between border-b border-line px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_8px_rgb(var(--color-cyan))]" />
          <span className="font-display text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-4 font-mono text-xs">
          <Link href="/docs" className="text-cyan">
            Docs
          </Link>
          <Link href="/app" className="text-muted transition-colors hover:text-cyan">
            Mission Control
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="border-b border-line pb-10">
          <SectionLabel>Documentation</SectionLabel>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {DOCS_META.appName}
          </h1>
          <p className="mt-2 font-mono text-sm text-cyan">{DOCS_META.tagline}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {DOCS_META.description}. Submit a goal in Mission Control, hire T3N-verified
            specialists, escrow native 0G per agent, and settle payment on-chain when work is
            complete.
          </p>
        </header>

        {/* Product */}
        <section className="border-b border-line py-12">
          <SectionLabel>Product</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-bold">How Orbital works</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Orbital is mission control for autonomous agent swarms. You remain the orchestrator —
            agents do the work, the contract holds the funds, Terminal 3 proves identity.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PRODUCT_STEPS.map((item) => (
              <div
                key={item.step}
                className="border border-line bg-surface/40 p-5 transition-colors hover:border-cyan/30"
              >
                <p className="font-mono text-xs text-cyan">
                  [{item.step}] {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Agents */}
        <section className="border-b border-line py-12">
          <SectionLabel>Specialist agents</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-bold">Agent roster</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Three specialists run in sequence — never in parallel. Output flows Research →
            Analysis → Writer. Each agent has a dedicated wallet and Terminal 3 DID used at
            verification and escrow time.
          </p>
          <div className="mt-8 overflow-hidden border border-line">
            <div className="hidden border-b border-line bg-surface/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-muted sm:grid sm:grid-cols-[1.2fr_1.8fr_1fr_1.2fr] sm:gap-4">
              <span>Agent</span>
              <span>Role</span>
              <span>Wallet</span>
              <span>DID</span>
            </div>
            {DOCS_META.agents.map((agent, i) => (
              <div
                key={agent.roleKey}
                className="border-b border-line px-4 py-4 last:border-b-0 sm:grid sm:grid-cols-[1.2fr_1.8fr_1fr_1.2fr] sm:items-start sm:gap-4"
              >
                <div>
                  <p className="font-mono text-[10px] text-cyan">
                    Agent {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold">{agent.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase text-muted">{agent.roleKey}</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:mt-0">{agent.role}</p>
                <a
                  href={addressExplorerUrl(agent.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 break-all font-mono text-[11px] text-cyan transition-colors hover:text-cyan/80 sm:mt-0"
                >
                  {agent.address}
                </a>
                <p className="mt-2 break-all font-mono text-[11px] text-muted/80 sm:mt-0">
                  {agent.did}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Network */}
        <section className="border-b border-line py-12">
          <SectionLabel>Network</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-bold">0G Galileo Testnet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            All escrow and settlement transactions run on 0G Galileo. Fund your wallet with testnet
            0G from the faucet before creating tasks or paying gas.
          </p>
          <dl className="mt-8 overflow-hidden border border-line bg-surface/30">
            <CopyRow label="Network" value={NETWORK.name} />
            <CopyRow label="Chain ID" value={String(NETWORK.chainId)} />
            <CopyRow label="Currency" value={NETWORK.currency} />
            <CopyRow label="RPC" value={NETWORK.rpcUrl} href={NETWORK.rpcUrl} />
            <CopyRow label="Explorer" value={NETWORK.explorerUrl} href={NETWORK.explorerUrl} />
            <CopyRow label="Faucet" value={NETWORK.faucetUrl} href={NETWORK.faucetUrl} />
            <CopyRow label="0G Docs" value={NETWORK.docsUrl} href={NETWORK.docsUrl} />
          </dl>
        </section>

        {/* Contracts */}
        <section className="border-b border-line py-12">
          <SectionLabel>Contracts</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-bold">On-chain addresses</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Deployed Escrow contract on Galileo. Mission Control reads task state from this
            address; new hires call <code className="text-cyan">createTask</code> with agent
            address and verified DID.
          </p>
          <div className="mt-8 border border-line bg-surface/30 p-5">
            <p className="font-display text-lg font-semibold">{CONTRACTS.escrow.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {CONTRACTS.escrow.description}
            </p>
            <a
              href={addressExplorerUrl(CONTRACTS.escrow.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block break-all font-mono text-sm text-cyan transition-colors hover:text-cyan/80"
            >
              {CONTRACTS.escrow.address}
            </a>
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wide">
              <span className="border border-line px-2 py-1 text-muted">createTask</span>
              <span className="border border-line px-2 py-1 text-muted">markCompleted</span>
              <span className="border border-line px-2 py-1 text-muted">releasePayment</span>
              <span className="border border-line px-2 py-1 text-muted">tasks</span>
            </div>
          </div>
        </section>

        {/* API */}
        <section className="border-b border-line py-12">
          <SectionLabel>API</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-bold">Server routes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Agent verification and LLM execution run server-side. API keys (T3N, Groq) are never
            exposed to the browser.
          </p>
          <div className="mt-8 space-y-4">
            {API_ROUTES.map((route) => (
              <div key={route.path} className="border border-line bg-surface/30 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-cyan/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase text-cyan">
                    {route.method}
                  </span>
                  <code className="font-mono text-sm text-ink">{route.path}</code>
                </div>
                <p className="mt-2 font-mono text-[11px] text-muted">Body: {route.body}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{route.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="py-12">
          <SectionLabel>Stack</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-bold">Built with</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Identity", "Terminal 3 (T3N) — TEE-backed DID per agent"],
              ["Execution", "Groq — llama-3.3-70b-versatile"],
              ["Settlement", "Solidity Escrow on 0G Galileo"],
              ["Frontend", "Next.js, wagmi, RainbowKit"],
              ["Contracts", "Hardhat 3, Ignition, viem"],
            ].map(([label, value]) => (
              <li
                key={label}
                className="border border-line bg-surface/30 px-4 py-3 text-sm"
              >
                <span className="font-mono text-[10px] uppercase tracking-wide text-cyan">
                  {label}
                </span>
                <p className="mt-1 text-muted">{value}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="bg-cyan px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-bg transition-colors hover:bg-cyan/90"
            >
              Open Mission Control
            </Link>
            <Link
              href="/"
              className="border border-line px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:border-cyan hover:text-cyan"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
