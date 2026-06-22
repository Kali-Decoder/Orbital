import { formatEther, parseEther } from "viem";
import { ESCROW_ADDRESS, ESCROW_AMOUNT_PER_TASK_OG } from "@/lib/contract";
import { NATIVE_CURRENCY_SYMBOL, zeroGGalileoTestnet } from "@/lib/chain";

export type InvoiceTask = {
  agent: { name: string; roleKey: string };
  did?: string;
  taskId?: number;
  txHash?: string;
  escrowAmountOg?: string;
};

export function taskEscrowAmount(task: InvoiceTask): string {
  return task.escrowAmountOg ?? ESCROW_AMOUNT_PER_TASK_OG;
}

export function totalOgSpent(tasks: InvoiceTask[]): string {
  const total = tasks.reduce(
    (sum, task) => sum + parseEther(taskEscrowAmount(task)),
    0n
  );
  return formatEther(total);
}

export function buildInvoiceText(tasks: InvoiceTask[]): string {
  const lines = [
    "MISSION INVOICE",
    "-".repeat(40),
    `Network: ${zeroGGalileoTestnet.name}`,
    `Escrow: ${ESCROW_ADDRESS}`,
    "",
    "Line items:",
  ];

  tasks.forEach((task, i) => {
    const amount = taskEscrowAmount(task);
    const taskRef = task.taskId != null ? `#${task.taskId}` : "—";
    const tx = task.txHash ? task.txHash.slice(0, 10) + "..." : "—";
    lines.push(
      `${i + 1}. ${task.agent.name} (${task.agent.roleKey})`,
      `   Escrow: ${amount} ${NATIVE_CURRENCY_SYMBOL}  |  Task ${taskRef}  |  TX ${tx}`
    );
  });

  lines.push(
    "",
    `Total ${NATIVE_CURRENCY_SYMBOL} spent: ${totalOgSpent(tasks)} ${NATIVE_CURRENCY_SYMBOL}`,
    `Agents hired: ${tasks.length}`,
    ""
  );

  return lines.join("\n");
}
