"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { shortenAddress } from "@/lib/utils";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-cyan-300 font-mono bg-black/30 px-3 py-1 rounded-lg border border-cyan-500/30">
          {shortenAddress(address)}
        </div>
        <Button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 border border-red-500/30 hover:border-red-400/50"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-6 py-3 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400/50 transform hover:scale-105 neon-glow"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
              Connecting...
            </span>
          ) : (
            `Connect ${connector.name}`
          )}
        </Button>
      ))}
    </div>
  );
}
