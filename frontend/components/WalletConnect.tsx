"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import {
  zeroGGalileoTestnet,
  BLOCK_EXPLORER_URL,
  NATIVE_CURRENCY_SYMBOL,
} from "@/lib/chain";

function shorten(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(value: bigint, decimals: number) {
  const str = value.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const frac = str.slice(-decimals).replace(/0+$/, "").slice(0, 4);
  return frac ? `${whole}.${frac}` : whole;
}

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { data: balance } = useBalance({ address });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const wrongChain = isConnected && chain?.id !== zeroGGalileoTestnet.id;

  if (!mounted) {
    return <div className="h-9 w-36 animate-pulse border border-line bg-surface" />;
  }

  if (!isConnected || !address) {
    return (
      <button
        type="button"
        onClick={openConnectModal}
        className="bg-cyan px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-bg transition-colors hover:bg-cyan/90"
      >
        Connect Wallet
      </button>
    );
  }

  if (wrongChain) {
    return (
      <button
        type="button"
        onClick={openChainModal}
        className="flex items-center gap-2 border border-warning px-4 py-2 font-mono text-xs uppercase tracking-wide text-warning transition-colors hover:bg-warning/10"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
        Switch Network
      </button>
    );
  }

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const balanceLabel =
    balance != null
      ? `${formatBalance(balance.value, balance.decimals)} ${NATIVE_CURRENCY_SYMBOL}`
      : "—";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 border border-line bg-surface px-3 py-2 font-mono text-xs transition-colors hover:border-cyan"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_rgb(var(--color-success))]" />
        <span className="text-ink">{shorten(address)}</span>
        <span className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
          {chain?.name ?? zeroGGalileoTestnet.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 border border-line bg-surface shadow-[0_8px_32px_rgb(0_0_0/0.55)]">
          <div className="border-b border-line px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Wallet
            </p>
            <p className="mt-1 font-mono text-sm text-ink">{balanceLabel}</p>
          </div>

          <div className="border-b border-line px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Address
            </p>
            <button
              type="button"
              onClick={copyAddress}
              className="mt-1 break-all text-left font-mono text-xs text-cyan hover:text-cyan/80"
            >
              {copied ? "Copied!" : address}
            </button>
          </div>

          <div className="flex flex-col gap-px bg-line p-px">
            <a
              href={`${BLOCK_EXPLORER_URL}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted transition-colors hover:bg-bg hover:text-cyan"
            >
              View on Explorer
            </a>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                disconnect();
              }}
              className="bg-surface px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-wide text-danger transition-colors hover:bg-bg hover:text-danger/80"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
