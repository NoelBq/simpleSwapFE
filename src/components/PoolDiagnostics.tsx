"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { AlertTriangle, RefreshCw, DollarSign } from "lucide-react";

import { TOKENS, type Token } from "@/types/contracts";
import { usePoolInfo } from "@/hooks/useSimpleSwap";
import { useTokenBalance } from "@/hooks/useToken";
import { formatTokenAmount } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function PoolDiagnostics() {
  const { address } = useAccount();
  const [selectedTokenA, setSelectedTokenA] = useState<Token>(TOKENS.KAIZEN);
  const [selectedTokenB, setSelectedTokenB] = useState<Token>(TOKENS.YUREI);

  const { data: poolInfo, refetch: refetchPool } = usePoolInfo(
    selectedTokenA.address,
    selectedTokenB.address
  );
  const { data: balanceA } = useTokenBalance(selectedTokenA.address, address);
  const { data: balanceB } = useTokenBalance(selectedTokenB.address, address);

  const reserveA = poolInfo?.[2] || 0n;
  const reserveB = poolInfo?.[3] || 0n;
  const totalSupply = poolInfo?.[4] || 0n;
  const poolExists = poolInfo?.[0] !== undefined;
  const hasLiquidity = reserveA > 0n && reserveB > 0n;

  const getPoolStatus = () => {
    if (!poolExists)
      return {
        status: "unknown",
        message: "Pool status unknown",
        color: "gray",
      };
    if (!hasLiquidity)
      return {
        status: "empty",
        message: "Pool is empty - no liquidity",
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

    const priceAtoB =
      Number(reserveB) /
      10 ** selectedTokenB.decimals /
      (Number(reserveA) / 10 ** selectedTokenA.decimals);
    const priceBtoA =
      Number(reserveA) /
      10 ** selectedTokenA.decimals /
      (Number(reserveB) / 10 ** selectedTokenB.decimals);

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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Token A</label>
          <select
            value={selectedTokenA.symbol}
            onChange={(e) => {
              const token = Object.values(TOKENS).find(
                (t) => t.symbol === e.target.value
              );
              if (token) setSelectedTokenA(token);
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          >
            {Object.values(TOKENS).map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Token B</label>
          <select
            value={selectedTokenB.symbol}
            onChange={(e) => {
              const token = Object.values(TOKENS).find(
                (t) => t.symbol === e.target.value
              );
              if (token) setSelectedTokenB(token);
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          >
            {Object.values(TOKENS).map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
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

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              Reserve {selectedTokenA.symbol}
            </div>
            <div className="font-mono text-lg">
              {formatTokenAmount(reserveA, selectedTokenA.decimals, 6)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              Reserve {selectedTokenB.symbol}
            </div>
            <div className="font-mono text-lg">
              {formatTokenAmount(reserveB, selectedTokenB.decimals, 6)}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total LP Supply</div>
          <div className="font-mono text-lg">
            {formatTokenAmount(totalSupply, 18, 6)}
          </div>
        </div>

        {/* Current Prices */}
        {prices && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium text-blue-800">
                Current Prices
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                1 {selectedTokenA.symbol} = {prices.priceAtoB.toFixed(6)}{" "}
                {selectedTokenB.symbol}
              </div>
              <div>
                1 {selectedTokenB.symbol} = {prices.priceBtoA.toFixed(6)}{" "}
                {selectedTokenA.symbol}
              </div>
            </div>
          </div>
        )}

        {address && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800 mb-2">
              Your Token Balances
            </div>
            <div className="space-y-1 text-sm">
              <div>
                {selectedTokenA.symbol}:{" "}
                {balanceA
                  ? formatTokenAmount(balanceA, selectedTokenA.decimals, 6)
                  : "0"}
              </div>
              <div>
                {selectedTokenB.symbol}:{" "}
                {balanceB
                  ? formatTokenAmount(balanceB, selectedTokenB.decimals, 6)
                  : "0"}
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="text-sm font-medium text-yellow-800 mb-2">
            💡 Recommendations
          </div>
          <div className="space-y-1 text-sm text-yellow-700">
            {!hasLiquidity && (
              <div>
                • This pool is empty. You&apos;ll be the first liquidity
                provider and can set the initial price ratio.
              </div>
            )}
            {hasLiquidity && (reserveA < 1000n || reserveB < 1000n) && (
              <div>
                • Pool has very low liquidity. Consider adding more to improve
                trading efficiency.
              </div>
            )}
            {!address && (
              <div>• Connect your wallet to see your token balances.</div>
            )}
            {address && balanceA === 0n && balanceB === 0n && (
              <div>
                • You don&apos;t have any tokens. You&apos;ll need to get some
                tokens first before providing liquidity.
              </div>
            )}
          </div>
        </div>

        <details className="bg-gray-50 p-3 rounded-lg">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            🔍 Raw Debug Data
          </summary>
          <div className="mt-2 space-y-1 text-xs font-mono text-gray-600">
            <div>Pool exists: {poolExists ? "✅ Yes" : "❌ No"}</div>
            <div>Reserve A (raw): {reserveA.toString()}</div>
            <div>Reserve B (raw): {reserveB.toString()}</div>
            <div>Total Supply (raw): {totalSupply.toString()}</div>
            <div>
              Pool Info:{" "}
              {poolInfo
                ? JSON.stringify(poolInfo.map((v) => v?.toString()))
                : "null"}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
