"use client";

import { useAccount } from "wagmi";
import { ArrowLeft, Droplet } from "lucide-react";
import Link from "next/link";

import { WalletConnect } from "@/components/WalletConnect";
import { SimpleLiquidityComponent } from "@/components/SimpleLiquidityComponent";
import { SimplePoolDiagnostics } from "@/components/SimplePoolDiagnostics";

export default function LiquidityPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-cyan-500/30 sticky top-0 z-50 shadow-lg shadow-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Swap</span>
              </Link>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-400/50">
                  <Droplet className="h-5 w-5 text-black" />
                </div>
                <h1 className="text-xl font-bold text-blue-400 glow-text">
                  Liquidity Pool
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-400/50 animate-pulse">
                <Droplet className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 glow-text">
                Liquidity Management
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Add or remove liquidity from the{" "}
                <span className="text-blue-400 font-semibold">
                  KaizenCoin/YureiCoin
                </span>{" "}
                pool and earn fees from trades.
              </p>
              <WalletConnect />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            {/* Main Liquidity Component */}
            <div className="w-full max-w-md">
              <SimpleLiquidityComponent />
            </div>

            {/* Pool Diagnostics */}
            <div className="w-full max-w-2xl">
              <SimplePoolDiagnostics />
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                    <Droplet className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-300">
                    Liquidity Mining
                  </h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Provide liquidity to earn trading fees. Your share of the pool
                  determines your portion of the fees collected from each trade.
                </p>
              </div>

              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-purple-400/30">
                    <Droplet className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-300">
                    Impermanent Loss
                  </h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Be aware of impermanent loss when providing liquidity. Price
                  changes between tokens can affect your total value.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-blue-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-400">
            <p className="text-blue-300">
              SimpleSwap Liquidity Pool - Built for{" "}
              <span className="text-purple-400">Sepolia testnet</span>
            </p>
            <p className="mt-1 text-gray-500">
              ⚠️ Testnet only - Do not use real funds
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
