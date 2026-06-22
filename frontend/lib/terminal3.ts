import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";
import { AGENTS } from "@/lib/agents";

setEnvironment("sandbox");

// Server-only: maps each agent's wallet address to its private key.
// Lowercased because addresses arrive from the client as whatever case the
// caller sent.
const AGENT_KEYS: Record<string, string | undefined> = {
  [AGENTS[0].address.toLowerCase()]: process.env.RESEARCH_AGENT_KEY,
  [AGENTS[1].address.toLowerCase()]: process.env.ANALYSIS_AGENT_KEY,
  [AGENTS[2].address.toLowerCase()]: process.env.WRITER_AGENT_KEY,
};

// The wasm component is stateless and can be reused across clients/agents.
let wasmComponentPromise: ReturnType<typeof loadWasmComponent> | null = null;
function getWasmComponent() {
  if (!wasmComponentPromise) wasmComponentPromise = loadWasmComponent();
  return wasmComponentPromise;
}

const didCache = new Map<string, string>();

export async function verifyAgentByAddress(
  agentAddress: string
): Promise<{ did: string; address: string }> {
  const lookup = agentAddress.toLowerCase();
  const key = AGENT_KEYS[lookup];
  if (!key) throw new Error("Unknown agent address");

  const cached = didCache.get(lookup);
  if (cached) return { did: cached, address: agentAddress };

  const wasmComponent = await getWasmComponent();
  const address = eth_get_address(key);

  const client = new T3nClient({
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(address, undefined, key),
    },
  });

  await client.handshake();
  const did = await client.authenticate(createEthAuthInput(address));

  didCache.set(lookup, did.value);
  return { did: did.value, address };
}

// Orchestrator's own identity (Account-1) — used before this multi-agent
// flow existed; kept for any caller that still wants to verify itself.
let cachedOrchestratorDid: string | null = null;

export async function getVerifiedAgentDid(): Promise<string> {
  if (cachedOrchestratorDid) return cachedOrchestratorDid;

  const key = process.env.T3N_API_KEY!;
  const address = eth_get_address(key);
  const wasmComponent = await getWasmComponent();

  const client = new T3nClient({
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(address, undefined, key),
    },
  });

  await client.handshake();
  const did = await client.authenticate(createEthAuthInput(address));

  cachedOrchestratorDid = did.value;
  return cachedOrchestratorDid;
}
