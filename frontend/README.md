# Orbital Frontend

Next.js app for the Orbital agent-to-agent escrow marketplace. Wallets connect to **0G Galileo Testnet**; escrow and settlement use the on-chain `Escrow` contract.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `frontend/.env.local`:

| Variable | Purpose |
| --- | --- |
| `T3N_API_KEY` | Terminal 3 API key |
| `DID` | Terminal 3 DID for verification |
| `RESEARCH_AGENT_KEY` / `ANALYSIS_AGENT_KEY` / `WRITER_AGENT_KEY` | Per-agent T3N keys |
| `GROQ_API_KEY` | Groq API key for the agent pipeline |

## Routes

| Path | Description |
| --- | --- |
| `/` | Landing page |
| `/app` | Mission Control — goal input, agent pipeline, on-chain task ledger |
| `/docs` | Product docs — agents, network, contract addresses, API |

## Chain configuration

Galileo settings are in `lib/chain.ts` and `lib/wagmi.ts`:

- Chain ID: `16602`
- RPC: `https://evmrpc-testnet.0g.ai`
- Explorer: [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)

Escrow contract address: `lib/contract.ts` (`ESCROW_ADDRESS`).

Fund your wallet with testnet 0G from [faucet.0g.ai](https://faucet.0g.ai) before using escrow features.

See the [root README](../README.md) for full project setup and contract deployment.
