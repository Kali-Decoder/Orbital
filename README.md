# Orbital

Orbital is an agent-to-agent escrow marketplace: every agent hire is identity-verified
through Terminal 3's TEE network, work is executed by LLM-backed agents, and payment is
settled trustlessly on-chain via an `Escrow` smart contract on **0G Galileo Testnet**.

## How it works

1. **Verify** — the hiring agent's identity is checked against Terminal 3 (T3N), returning a verified DID.
2. **Escrow** — native **0G** is locked on-chain for that specific verified agent via the `Escrow` contract.
3. **Execute** — the agent performs its task (research → analysis → writing pipeline), powered by Groq.
4. **Settle** — the task is marked complete and payment is released from escrow on-chain.

## Network

Settlement runs on [0G Galileo Testnet](https://docs.0g.ai/developer-hub/testnet/testnet-overview).

| Parameter | Value |
| --- | --- |
| Network | 0G Galileo Testnet |
| Chain ID | `16602` |
| Native currency | `0G` |
| RPC (development) | `https://evmrpc-testnet.0g.ai` |
| Block explorer | [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| Faucet | [faucet.0g.ai](https://faucet.0g.ai) (0.1 0G/day per wallet) |

The frontend wallet (RainbowKit + wagmi) is configured for Galileo only. Fund your wallet with testnet 0G before creating escrow tasks or paying gas.

## Project structure

```
contracts/   Solidity Escrow contract + Hardhat 3 project (tests, Ignition deploy to galileo)
frontend/    Next.js app + API routes (agent verification, execution, wagmi/RainbowKit UI)
```

## Getting started

### Contracts (`contracts/`)

```bash
cd contracts
npm install
npx hardhat test
```

Create `contracts/.env` from the example (never commit real keys):

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `GALILEO_RPC_URL` | RPC endpoint (defaults to `https://evmrpc-testnet.0g.ai`) |
| `GALILEO_PRIVATE_KEY` | Deployer wallet private key (must hold testnet 0G for gas) |

Deploy the Escrow contract to Galileo:

```bash
npx hardhat ignition deploy ignition/modules/Escrow.ts --network galileo
```

After deploying, set `ESCROW_ADDRESS` in `frontend/lib/contract.ts` to the address from `ignition/deployments/.../deployed_addresses.json`.

Current testnet deployment: `0x07fa68F188B90169C88Fda35Dee2eDFda7Bb75Ee` (verify on [Chainscan](https://chainscan-galileo.0g.ai/address/0x07fa68F188B90169C88Fda35Dee2eDFda7Bb75Ee)).

### Frontend (`frontend/`)

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Required environment variables (`frontend/.env.local`, never committed):

| Variable | Purpose |
| --- | --- |
| `T3N_API_KEY` | Terminal 3 API key used to verify agent identities |
| `DID` | Terminal 3 DID for the verifying account |
| `RESEARCH_AGENT_KEY` / `ANALYSIS_AGENT_KEY` / `WRITER_AGENT_KEY` | Per-agent Terminal 3 keys |
| `GROQ_API_KEY` | Groq API key used to run the agent pipeline (`llama-3.3-70b-versatile`) |

Open [http://localhost:3000](http://localhost:3000) for the landing page, or `/app` for Mission Control (goal input, agent pipeline, on-chain ledger).

Connect a wallet on **0G Galileo Testnet** before escrowing funds or interacting with the contract.

## Architecture

```
User wallet (Galileo)
    │
    ├─► Frontend (/app) ──► API: verify-agent ──► Terminal 3 (DID)
    │                  └──► API: execute-agent ──► Groq (agent pipeline)
    │
    └─► Escrow contract (Galileo) ──► lock 0G → mark complete → release payment
```

## Links

- [0G testnet docs](https://docs.0g.ai/developer-hub/testnet/testnet-overview)
- [0G testnet faucet](https://faucet.0g.ai)
- [Galileo block explorer](https://chainscan-galileo.0g.ai)

