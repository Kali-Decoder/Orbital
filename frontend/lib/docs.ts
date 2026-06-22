import { AGENTS } from "@/lib/agents";
import { ESCROW_ADDRESS } from "@/lib/contract";
import {
  BLOCK_EXPLORER_URL,
  NATIVE_CURRENCY_SYMBOL,
  zeroGGalileoTestnet,
} from "@/lib/chain";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/lib/brand";

export const PRODUCT_STEPS = [
  {
    step: "01",
    title: "Verify",
    description:
      "Each specialist agent authenticates via Terminal 3 (T3N). A verified DID is returned and bound to the agent wallet before escrow can open.",
  },
  {
    step: "02",
    title: "Escrow",
    description:
      "Native 0G is locked on-chain per agent hire through the Escrow smart contract on 0G Galileo Testnet. Funds stay locked until the task is marked complete.",
  },
  {
    step: "03",
    title: "Execute",
    description:
      "The Research → Analysis → Writer pipeline runs sequentially. Each agent receives the prior agent's output plus the user's goal, powered by Groq (llama-3.3-70b-versatile).",
  },
  {
    step: "04",
    title: "Settle",
    description:
      "The contract owner marks the task complete on-chain. Payment is released to the verified agent wallet — trustless, auditable, per-task.",
  },
] as const;

export const NETWORK = {
  name: zeroGGalileoTestnet.name,
  chainId: zeroGGalileoTestnet.id,
  currency: NATIVE_CURRENCY_SYMBOL,
  rpcUrl: zeroGGalileoTestnet.rpcUrls.default.http[0],
  explorerUrl: BLOCK_EXPLORER_URL,
  faucetUrl: "https://faucet.0g.ai",
  docsUrl: "https://docs.0g.ai/developer-hub/testnet/testnet-overview",
} as const;

export const CONTRACTS = {
  escrow: {
    name: "Escrow",
    address: ESCROW_ADDRESS,
    description:
      "Per-task escrow contract. Stores agent address, locked amount, completion/payment flags, and verified DID. Owner marks tasks complete and releases payment.",
  },
} as const;

export const API_ROUTES = [
  {
    method: "POST",
    path: "/api/verify-agent",
    body: "{ agentAddress: string }",
    description: "Verifies an agent wallet against Terminal 3 and returns its DID.",
  },
  {
    method: "POST",
    path: "/api/execute-agent",
    body: "{ agentRole, goal, previousOutput? }",
    description:
      "Runs a specialist agent (research | analysis | writer) via Groq. Server-side only.",
  },
] as const;

export const DOCS_META = {
  appName: APP_NAME,
  tagline: APP_TAGLINE,
  description: APP_DESCRIPTION,
  agents: AGENTS,
} as const;
