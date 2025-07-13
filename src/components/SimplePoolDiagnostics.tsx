"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  AlertTriangle,
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { CONTRACTS } from "@/types/contracts";
import { SIMPLE_SWAP_ABI } from "@/lib/contractABI";
import { useTokenBalance } from "@/hooks/useToken";
import { formatTokenAmount } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function SimplePoolDiagnostics() {
  const { address } = useAccount();

  const { data: tokenAAddress } = useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "tokenA",
  });

  const { data: tokenBAddress } = useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "tokenB",
  });

  const { data: poolInfo, refetch: refetchPool } = useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getPoolInfo",
    query: {
      staleTime: 30000,
    },
  });

  const { data: balanceA } = useTokenBalance(
    tokenAAddress as `0x${string}`,
    address
  );
  const { data: balanceB } = useTokenBalance(
    tokenBAddress as `0x${string}`,
    address
  );

  const reserveA = poolInfo?.[0] || 0n;
  const reserveB = poolInfo?.[1] || 0n;
  const totalSupply = poolInfo?.[2] || 0n;

  const hasLiquidity = reserveA > 0n && reserveB > 0n;

  const getPoolStatus = () => {
    if (!poolInfo)
      return {
        status: "loading",
        message: "Loading pool data...",
        color: "gray",
      };
    if (!hasLiquidity)
      return {
        status: "empty",
        message: "Pool is empty - needs initial liquidity",
        color: "red",
      };
    if (reserveA < 1000n || reserveB < 1000n)
      return { status: "low", message: "Very low liquidity", color: "yellow" };
    return {
      status: "healthy",
      message: "Pool has sufficient liquidity",
      color: "green",
    };
  };

  const poolStatus = getPoolStatus();

  const calculatePrice = () => {
    if (!hasLiquidity) return null;

    const priceAtoB = Number(reserveB) / 1e18 / (Number(reserveA) / 1e18);
    const priceBtoA = Number(reserveA) / 1e18 / (Number(reserveB) / 1e18);

    return { priceAtoB, priceBtoA };
  };

  const prices = calculatePrice();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-800">
          Pool Diagnostics
        </h2>
        <Button
          onClick={() => refetchPool()}
          variant="ghost"
          size="sm"
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Pool Status Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Pool Contract
            </span>
          </div>
          <div className="text-green-700 text-sm">✅ Deployed & Active</div>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            hasLiquidity
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {hasLiquidity ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                hasLiquidity ? "text-green-800" : "text-red-800"
              }`}
            >
              Liquidity Status
            </span>
          </div>
          <div
            className={`text-sm ${
              hasLiquidity ? "text-green-700" : "text-red-700"
            }`}
          >
            {hasLiquidity ? "✅ Has Liquidity" : "❌ Empty Pool"}
          </div>
        </div>
      </div>

      {/* Token Addresses */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Contract Token Pair
        </div>
        <div className="space-y-1 text-xs font-mono">
          <div>
            <span className="text-gray-500">Token A:</span>{" "}
            {tokenAAddress || "Loading..."}
          </div>
          <div>
            <span className="text-gray-500">Token B:</span>{" "}
            {tokenBAddress || "Loading..."}
          </div>
        </div>
      </div>

      {/* Pool Status */}
      <div
        className={`p-4 rounded-lg mb-4 ${
          poolStatus.color === "red"
            ? "bg-red-50 border border-red-200"
            : poolStatus.color === "yellow"
            ? "bg-yellow-50 border border-yellow-200"
            : poolStatus.color === "green"
            ? "bg-green-50 border border-green-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div
          className={`font-medium ${
            poolStatus.color === "red"
              ? "text-red-800"
              : poolStatus.color === "yellow"
              ? "text-yellow-800"
              : poolStatus.color === "green"
              ? "text-green-800"
              : "text-gray-800"
          }`}
        >
          Status: {poolStatus.message}
        </div>
      </div>

      {/* Pool Information */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Reserve A</div>
            <div className="font-mono text-lg">
              {formatTokenAmount(reserveA, 18, 6)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Reserve B</div>
            <div className="font-mono text-lg">
              {formatTokenAmount(reserveB, 18, 6)}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total LP Supply</div>
          <div className="font-mono text-lg">
            {formatTokenAmount(totalSupply, 18, 6)}
          </div>
        </div>

        {prices && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium text-blue-800">
                Current Prices
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>1 Token A = {prices.priceAtoB.toFixed(6)} Token B</div>
              <div>1 Token B = {prices.priceBtoA.toFixed(6)} Token A</div>
            </div>
          </div>
        )}

        {/* Your Balances */}
        {address && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800 mb-2">
              Your Token Balances
            </div>
            <div className="space-y-1 text-sm">
              <div>
                Token A: {balanceA ? formatTokenAmount(balanceA, 18, 6) : "0"}
              </div>
              <div>
                Token B: {balanceB ? formatTokenAmount(balanceB, 18, 6) : "0"}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2">
            ℹ️ Key Information
          </div>
          <div className="space-y-1 text-sm text-blue-700">
            <div>
              • This is a SimpleSwap contract - the pool already exists!
            </div>
            <div>
              • No need to &quot;create&quot; a pool - you just need to add
              liquidity
            </div>
            <div>• Token addresses are fixed at deployment time</div>
            {!hasLiquidity && (
              <div className="font-medium text-blue-800">
                • You can be the first liquidity provider and set the initial
                price ratio
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="text-sm font-medium text-yellow-800 mb-2">
            💡 Next Steps
          </div>
          <div className="space-y-1 text-sm text-yellow-700">
            {!hasLiquidity && (
              <div>
                • Add initial liquidity using the form above to establish
                trading
              </div>
            )}
            {hasLiquidity && (reserveA < 1000n || reserveB < 1000n) && (
              <div>
                • Consider adding more liquidity to improve trading efficiency
              </div>
            )}
            {!address && (
              <div>• Connect your wallet to see your token balances</div>
            )}
            {address &&
              (!balanceA || balanceA === 0n) &&
              (!balanceB || balanceB === 0n) && (
                <div>
                  • You need to acquire some of the pool tokens before providing
                  liquidity
                </div>
              )}
          </div>
        </div>

        <details className="bg-gray-50 p-3 rounded-lg">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            🔍 Raw Debug Data
          </summary>
          <div className="mt-2 space-y-1 text-xs font-mono text-gray-600">
            <div>Contract: {CONTRACTS.SIMPLE_SWAP}</div>
            <div>Token A Address: {tokenAAddress || "Not loaded"}</div>
            <div>Token B Address: {tokenBAddress || "Not loaded"}</div>
            <div>Reserve A (raw): {reserveA.toString()}</div>
            <div>Reserve B (raw): {reserveB.toString()}</div>
            <div>Total Supply (raw): {totalSupply.toString()}</div>
            <div>
              Pool Info Response:{" "}
              {poolInfo
                ? `[${poolInfo.map((v) => v.toString()).join(", ")}]`
                : "null"}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
