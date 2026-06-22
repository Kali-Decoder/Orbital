import { ESCROW_ADDRESS } from "@/lib/contract";
import { NATIVE_CURRENCY_SYMBOL, txExplorerUrl, zeroGGalileoTestnet } from "@/lib/chain";
import { type InvoiceTask, taskEscrowAmount, totalOgSpent } from "@/lib/invoice";

type MissionInvoiceProps = {
  tasks: InvoiceTask[];
};

function shortenHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function MissionInvoice({ tasks }: MissionInvoiceProps) {
  const total = totalOgSpent(tasks);

  return (
    <div className="mt-2 border border-line bg-[#0a0f14] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
            Mission Invoice
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted">{zeroGGalileoTestnet.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Total spent</p>
          <p className="font-display text-xl font-bold text-cyan">
            {total} {NATIVE_CURRENCY_SYMBOL}
          </p>
        </div>
      </div>

      <p className="mt-3 break-all font-mono text-[10px] text-muted">
        Escrow: {ESCROW_ADDRESS}
      </p>

      <div className="mt-4 overflow-hidden border border-line">
        <div className="hidden border-b border-line bg-surface/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-muted sm:grid sm:grid-cols-[1.4fr_0.8fr_0.5fr_0.9fr] sm:gap-3">
          <span>Agent</span>
          <span>Escrow</span>
          <span>Task</span>
          <span>TX</span>
        </div>
        {tasks.map((task, i) => (
          <div
            key={`${task.agent.roleKey}-${i}`}
            className="border-b border-line px-3 py-3 last:border-b-0 sm:grid sm:grid-cols-[1.4fr_0.8fr_0.5fr_0.9fr] sm:items-center sm:gap-3"
          >
            <div>
              <p className="font-display text-sm font-semibold text-ink">{task.agent.name}</p>
              <p className="font-mono text-[10px] uppercase text-muted">{task.agent.roleKey}</p>
            </div>
            <p className="mt-1 font-mono text-xs text-cyan sm:mt-0">
              {taskEscrowAmount(task)} {NATIVE_CURRENCY_SYMBOL}
            </p>
            <p className="mt-1 font-mono text-xs text-muted sm:mt-0">
              {task.taskId != null ? `#${task.taskId}` : "—"}
            </p>
            <div className="mt-1 sm:mt-0">
              {task.txHash ? (
                <a
                  href={txExplorerUrl(task.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-success underline hover:text-success/80"
                >
                  {shortenHash(task.txHash)}
                </a>
              ) : (
                <span className="font-mono text-xs text-muted">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
          {tasks.length} agent{tasks.length === 1 ? "" : "s"} · escrowed on-chain
        </p>
        <p className="font-mono text-sm font-semibold text-ink">
          Total: <span className="text-cyan">{total} {NATIVE_CURRENCY_SYMBOL}</span>
        </p>
      </div>
    </div>
  );
}