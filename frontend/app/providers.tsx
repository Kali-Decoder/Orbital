"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { zeroGGalileoTestnet } from "@/lib/chain";
import "@rainbow-me/rainbowkit/styles.css";

const rainbowKitTheme = darkTheme({
  accentColor: "#00D9FF",
  accentColorForeground: "#080C10",
  borderRadius: "small",
  fontStack: "system",
  overlayBlur: "small",
});

rainbowKitTheme.colors.modalBackground = "#0D1117";
rainbowKitTheme.colors.modalBorder = "#1C2A3A";
rainbowKitTheme.colors.modalText = "#E6EDF3";
rainbowKitTheme.colors.modalTextSecondary = "#7D8FA3";
rainbowKitTheme.colors.modalTextDim = "#7D8FA3";
rainbowKitTheme.colors.generalBorder = "#1C2A3A";
rainbowKitTheme.colors.generalBorderDim = "#1C2A3A";
rainbowKitTheme.colors.menuItemBackground = "#080C10";
rainbowKitTheme.colors.closeButton = "#7D8FA3";
rainbowKitTheme.colors.closeButtonBackground = "#0D1117";
rainbowKitTheme.colors.connectButtonBackground = "#00D9FF";
rainbowKitTheme.colors.connectButtonText = "#080C10";
rainbowKitTheme.colors.profileForeground = "#080C10";
rainbowKitTheme.colors.selectedOptionBorder = "#00D9FF";
rainbowKitTheme.colors.standby = "#7D8FA3";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme} initialChain={zeroGGalileoTestnet}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
