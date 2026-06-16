"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { VoteList } from "./components/VoteList";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const context = await sdk.context;
        if (context?.client?.clientFid) {
          setIsMiniApp(true);
          await sdk.actions.ready({ disableNativeGestures: true });
          const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
          if (farcasterConnector) {
            connect({ connector: farcasterConnector });
          }
        } else {
          await sdk.actions.ready({ disableNativeGestures: true }).catch(() => {});
        }
      } catch {
        await sdk.actions.ready({ disableNativeGestures: true }).catch(() => {});
      }
    };
    init();
  }, []);

  if (!mounted) return null;

  // Determine which connectors to show based on environment
  const getConnectorLabel = (id: string, name: string) => {
    if (id === 'farcasterFrame') return 'Connect Farcaster';
    if (id === 'metaMask') return 'Connect MetaMask';
    if (name === 'Coinbase Wallet') return 'Connect Base';
    return `Connect ${name}`;
  };

  const visibleConnectors = connectors.filter(c =>
    c.id === 'metaMask' || c.name === 'MetaMask' ||
    c.id === 'farcasterFrame' ||
    c.name === 'Coinbase Wallet'
  );

  return (
    <main className="max-w-md mx-auto px-4 py-6" style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          📚 Book vs 🎬 Movie
        </h1>
        <p className="text-gray-400 text-sm mt-1">Vote and earn 100 CSM per vote</p>

        <div className="mt-4">
          {isConnected ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {getConnectorLabel(connector.id, connector.name)}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {isConnected && address && <VoteList address={address} />}
    </main>
  );
}