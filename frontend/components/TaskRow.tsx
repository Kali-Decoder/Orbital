"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";
import { NATIVE_CURRENCY_SYMBOL, txExplorerUrl } from "@/lib/chain";

function shorten(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

// viem throws rich error objects; shortMessage is the human-readable summary.
function readableError(error: unknown): string {
  if (error && typeof error === "object" && "shortMessage" in error) {
    return String((error as { shortMessage: unknown }).shortMessage);
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function TaskRow({ taskId, owner }: { taskId: number; owner?: string }) {
  const { address: connectedAddress } = useAccount();
  const [copied, setCopied] = useState(false);

  // Reading from a public mapping returns its struct fields as a tuple.
  const { data: task, refetch } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "tasks",
    args: [BigInt(taskId)],
  });

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Refresh task state once the transaction confirms on-chain.
  const [hasRefetched, setHasRefetched] = useState(false);
  useEffect(() => {
    if (isConfirmed && !hasRefetched) {
      refetch();
      setHasRefetched(true);
    }
  }, [isConfirmed, hasRefetched, refetch]);

  if (!task) return null;

  const [agent, amount, isCompleted, isPaid] = task;
  const isOwner = !!connectedAddress && !!owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  const statusKey = isPaid ? "paid" : isCompleted ? "completed" : "pending";
  const statusLabel = isPaid ? "PAID" : isCompleted ? "COMPLETED" : "PENDING";
  const statusDot = isPaid ? "bg-success" : isCompleted ? "bg-warning" : "bg-muted";

  function handleMarkCompleted() {
    reset();
    setHasRefetched(false);
    writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "markCompleted",
      args: [BigInt(taskId)],
    });
  }

  function handleReleasePayment() {
    reset();
    setHasRefetched(false);
    writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "releasePayment",
      args: [BigInt(taskId)],
    });
  }

  function copyAddress() {
    navigator.clipboard.writeText(agent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const isBusy = isPending || isConfirming;

  return (
    <tr className="border-b border-line">
      <td className="px-3 py-2 font-mono text-xs text-muted">#{taskId}</td>
      <td className="px-3 py-2">
        <button
          onClick={copyAddress}
          title="Click to copy"
          className="font-mono text-xs text-ink hover:text-cyan"
        >
          {copied ? "Copied!" : shorten(agent)}
        </button>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-ink">{formatEther(amount)} {NATIVE_CURRENCY_SYMBOL}</td>
      <td className="px-3 py-2">
        <span className="flex items-center gap-2 font-mono text-xs text-muted" data-status={statusKey}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
          {statusLabel}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-col items-start gap-1">
          {!isCompleted && isOwner && (
            <button
              onClick={handleMarkCompleted}
              disabled={isBusy}
              className="border border-line px-2 py-1 font-mono text-[11px] text-ink hover:border-cyan hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? "CONFIRMING..." : "MARK COMPLETED"}
            </button>
          )}
          {isCompleted && !isPaid && (
            <button
              onClick={handleReleasePayment}
              disabled={isBusy}
              className="border border-success px-2 py-1 font-mono text-[11px] text-success hover:bg-success/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? "CONFIRMING..." : "RELEASE PAYMENT"}
            </button>
          )}
          {isPaid && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              PAID
            </span>
          )}

          {hash && (
            <a
              href={txExplorerUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-cyan underline hover:text-cyan/80"
            >
              VIEW TX
            </a>
          )}
          {error && <span className="font-mono text-[11px] text-danger">{readableError(error)}</span>}
        </div>
      </td>
    </tr>
  );
}
