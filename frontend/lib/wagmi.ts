import { http, createConfig } from "wagmi";
import { zeroGGalileoTestnet } from "@/lib/chain";

export const config = createConfig({
  chains: [zeroGGalileoTestnet],
  transports: {
    [zeroGGalileoTestnet.id]: http("https://evmrpc-testnet.0g.ai"),
  },
  ssr: true,
});
