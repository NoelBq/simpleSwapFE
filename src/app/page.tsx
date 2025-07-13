"use client";

import { useAccount } from "wagmi";
import { Wallet, ArrowLeftRight, Droplet } from "lucide-react";
import Link from "next/link";

import { WalletConnect } from "@/components/WalletConnect";
import { SwapComponent } from "@/components/SwapComponent";
import { PriceInfo } from "@/components/PriceInfo";
import { PriceCalculator } from "@/components/PriceCalculator";
import { TOKENS } from "@/types/contracts";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-cyan-500/30 sticky top-0 z-50 shadow-lg shadow-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/50">
                <ArrowLeftRight className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-xl font-bold text-cyan-400 glow-text">
                SimpleSwap
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/liquidity"
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
              >
                <Droplet className="h-4 w-4" />
                <span>Liquidity</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-400/50 animate-pulse">
                <Wallet className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-4 glow-text">
                Welcome to SimpleSwap
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                A decentralized exchange for swapping tokens on{" "}
                <span className="text-cyan-400 font-semibold">
                  Sepolia testnet
                </span>
                .
              </p>
              <div className="space-y-4">
                <WalletConnect />
                <div className="text-sm text-gray-400 space-y-1">
                  <p className="text-cyan-300">
                    → Connect your wallet to start swapping
                  </p>
                  <p>
                    Supported tokens:{" "}
                    <span className="text-pink-400 font-semibold">
                      KaizenCoin
                    </span>
                    ,{" "}
                    <span className="text-cyan-400 font-semibold">
                      YureiCoin
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
              <SwapComponent />
              <div className="grid grid-cols-1 gap-4">
                <PriceInfo tokenA={TOKENS.KAIZEN} tokenB={TOKENS.YUREI} />
                <PriceCalculator />
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-12 w-full max-w-2xl">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400/20 to-cyan-600/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
                    <ArrowLeftRight className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-cyan-300">
                    Token Swapping
                  </h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Instantly swap between{" "}
                  <span className="text-pink-400">KaizenCoin</span> and{" "}
                  <span className="text-cyan-400">YureiCoin</span> with minimal
                  slippage. Our automated market maker ensures fair pricing for
                  all trades.
                </p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="mt-12 p-6 bg-black/60 backdrop-blur-sm rounded-xl w-full max-w-4xl border border-gray-600/30 shadow-lg">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                Contract Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg border border-cyan-500/20">
                  <div className="font-medium text-cyan-300 mb-1">
                    SimpleSwap Contract
                  </div>
                  <div className="text-gray-400 font-mono text-xs break-all hover:text-cyan-300 transition-colors">
                    0x28AD8571EE183401999cd494955530CFe23fcb20
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-pink-500/20">
                  <div className="font-medium text-pink-300 mb-1">
                    KaizenCoin Token
                  </div>
                  <div className="text-gray-400 font-mono text-xs break-all hover:text-pink-300 transition-colors">
                    0xb3aD7bC1be272837aD94b1aabebf427b2Be47D9A
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-purple-500/20">
                  <div className="font-medium text-purple-300 mb-1">
                    YureiCoin Token
                  </div>
                  <div className="text-gray-400 font-mono text-xs break-all hover:text-purple-300 transition-colors">
                    0xcfBaCf4EC0F0676445ed0d41A99b22790F78a46d
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-center">
                <span className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></span>
                All contracts are deployed on{" "}
                <span className="text-cyan-400 ml-1">Sepolia testnet</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-cyan-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-400">
            <p className="text-cyan-300">
              SimpleSwap - Built with{" "}
              <span className="text-pink-400">Next.js</span>,{" "}
              <span className="text-cyan-400">Wagmi</span>, and{" "}
              <span className="text-purple-400">Viem</span>
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
