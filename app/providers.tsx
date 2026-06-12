"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

const config = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame(),
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [base.id]: http('https://base-rpc.publicnode.com'),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}