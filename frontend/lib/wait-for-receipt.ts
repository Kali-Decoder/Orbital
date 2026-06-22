import { getTransactionReceipt } from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { txExplorerUrl } from "@/lib/chain";

const PENDING_RECEIPT_PATTERNS = [
  "no matching receipts",
  "could not be found",
  "transaction receipt",
  "not found",
];

function isPendingReceiptError(error: unknown): boolean {
  const message =
    error && typeof error === "object" && "shortMessage" in error
      ? String((error as { shortMessage: unknown }).shortMessage)
      : error instanceof Error
        ? error.message
        : String(error);

  const lower = message.toLowerCase();
  return PENDING_RECEIPT_PATTERNS.some((pattern) => lower.includes(pattern));
}

/** Galileo's public RPC throws when a receipt isn't indexed yet instead of returning null. */
export async function waitForGalileoReceipt(hash: `0x${string}`) {
  const maxWaitMs = 120_000;
  const intervalMs = 3_000;
  const started = Date.now();

  while (Date.now() - started < maxWaitMs) {
    try {
      const receipt = await getTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error(`Transaction reverted on-chain. ${txExplorerUrl(hash)}`);
      }
      return receipt;
    } catch (error) {
      if (!isPendingReceiptError(error)) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Transaction confirmation timed out. It may still be pending — check ${txExplorerUrl(hash)}`
  );
}
