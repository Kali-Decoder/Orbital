import { defineChain } from "viem";

export const zeroGGalileoTestnet = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Chainscan",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
});

export const BLOCK_EXPLORER_URL = "https://chainscan-galileo.0g.ai";
export const NATIVE_CURRENCY_SYMBOL = "0G";

export function txExplorerUrl(hash: string) {
  return `${BLOCK_EXPLORER_URL}/tx/${hash}`;
}

export function addressExplorerUrl(address: string) {
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
}
