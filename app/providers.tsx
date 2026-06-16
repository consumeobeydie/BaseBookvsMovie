"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

const config = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame(),
    coinbaseWallet({ appName: 'BaseBookvsMovie' }),
    metaMask(),
    injected(),
  ],
  transports: {
    [base.id]: http('https://base-rpc.publicnode.com'),
  },
});

const queryClient = new QueryClient();

function SdkReady() {
  useEffect(() => {
    sdk.actions.ready({ disableNativeGestures: true }).catch(() => {});
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SdkReady />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}