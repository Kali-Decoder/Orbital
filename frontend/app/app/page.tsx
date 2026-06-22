import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { TaskList } from "@/components/TaskList";
import { GoalInput } from "@/components/GoalInput";
import { WalletConnect } from "@/components/WalletConnect";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <nav className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_8px_rgb(var(--color-cyan))]" />
          <span className="font-display text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="font-mono text-xs text-muted hover:text-cyan">
            Docs
          </Link>
          <WalletConnect />
        </div>
      </nav>

      <div className="flex items-center gap-4 px-6 pt-4">
        <Link href="/" className="font-mono text-xs text-muted hover:text-cyan">
          ← Back
        </Link>
      </div>

      {/* Mission control */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 border-b border-line pb-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              Mission Control
            </p>
          </div>
          <GoalInput />
        </div>
      </section>

      {/* Live task ledger */}
      <section className="border-t border-line px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-muted">
            On-Chain Ledger
          </p>
          <TaskList />
        </div>
      </section>
    </div>
  );
}
