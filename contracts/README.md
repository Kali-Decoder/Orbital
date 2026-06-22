# Orbital Contracts

Hardhat 3 project for Orbital's `Escrow` contract, deployed on **0G Galileo Testnet** (chain ID `16602`).

## Escrow contract

`Escrow.sol` locks native 0G per agent hire. Each task stores the agent address, escrowed amount, completion/payment flags, and the agent's Terminal 3 verified DID. Only the contract owner can mark tasks complete and release payment.

## Local development

```bash
npm install
npx hardhat test
```

Run Solidity or Node.js tests separately:

```bash
npx hardhat test solidity
npx hardhat test nodejs
```

## Deploy to 0G Galileo

1. Copy env template and set your deployer key:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `GALILEO_RPC_URL` | RPC URL (default: `https://evmrpc-testnet.0g.ai`) |
| `GALILEO_PRIVATE_KEY` | Private key for the deployer account |

2. Fund the deployer with testnet 0G from [faucet.0g.ai](https://faucet.0g.ai).

3. Deploy:

```bash
npx hardhat ignition deploy ignition/modules/Escrow.ts --network galileo
```

4. Copy the deployed address into `frontend/lib/contract.ts` as `ESCROW_ADDRESS`.

Network config lives in `hardhat.config.ts` under the `galileo` network entry.

## Useful links

- [0G Galileo testnet overview](https://docs.0g.ai/developer-hub/testnet/testnet-overview)
- [Galileo block explorer](https://chainscan-galileo.0g.ai)
