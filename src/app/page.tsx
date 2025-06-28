"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Wallet, ArrowLeftRight, Droplets, CheckCircle } from "lucide-react";

import { WalletConnect } from "@/components/WalletConnect";
import { SwapComponent } from "@/components/SwapComponent";
import { LiquidityComponent } from "@/components/LiquidityComponent";
import { VerificationComponent } from "@/components/VerificationComponent";
import { TokenDebugTest } from "@/components/TokenDebugTest";
import { RPCDebugTest } from "@/components/RPCDebugTest";

type TabType = "swap" | "liquidity" | "verify";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("swap");
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SimpleSwap</h1>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("swap")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                      activeTab === "swap"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span>Swap</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("liquidity")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                      activeTab === "liquidity"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Droplets className="h-4 w-4" />
                    <span>Liquidity</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("verify")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                      activeTab === "verify"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify</span>
                  </button>
                </div>
              )}

              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to SimpleSwap
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                A decentralized exchange for trading tokens and providing
                liquidity on Sepolia testnet.
              </p>
              <div className="space-y-4">
                <WalletConnect />
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Connect your wallet to start trading</p>
                  <p>Supported tokens: KaizenCoin, YureiCoin</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              {activeTab === "swap" ? (
                <SwapComponent />
              ) : activeTab === "liquidity" ? (
                <LiquidityComponent />
              ) : (
                <VerificationComponent />
              )}
            </div>

            {/* Debug Component */}
            <div className="mt-8 w-full max-w-4xl space-y-4">
              <TokenDebugTest />
              <RPCDebugTest />
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Token Swapping
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Instantly swap between KaizenCoin and YureiCoin with minimal
                  slippage. Our automated market maker ensures fair pricing for
                  all trades.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Liquidity Provision
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Provide liquidity to earn fees from trades. Add your tokens to
                  the pool and earn a share of all trading fees proportional to
                  your contribution.
                </p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="mt-12 p-6 bg-gray-50 rounded-xl w-full max-w-4xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">
                    SimpleSwap Contract
                  </div>
                  <div className="text-gray-500 font-mono text-xs break-all">
                    0x28AD8571EE183401999cd494955530CFe23fcb20
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">
                    KaizenCoin Token
                  </div>
                  <div className="text-gray-500 font-mono text-xs break-all">
                    0xb3aD7bC1be272837aD94b1aabebf427b2Be47D9A
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">
                    YureiCoin Token
                  </div>
                  <div className="text-gray-500 font-mono text-xs break-all">
                    0xcfBaCf4EC0F0676445ed0d41A99b22790F78a46d
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                All contracts are deployed on Sepolia testnet
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>SimpleSwap - Built with Next.js, Wagmi, and Viem</p>
            <p className="mt-1">Testnet only - Do not use real funds</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
