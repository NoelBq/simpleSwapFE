"use client";

import { useState } from "react";
import { TrendingUp, ArrowRightLeft } from "lucide-react";
import { type Token, TOKENS } from "@/types/contracts";
import { useSimpleSwapPoolInfo, useAmountOut } from "@/hooks/useSimpleSwap";
import { formatTokenAmount, parseTokenAmount } from "@/lib/utils";

interface PriceInfoProps {
  tokenA: Token;
  tokenB: Token;
}

export function PriceInfo({ tokenA, tokenB }: PriceInfoProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { data: poolData } = useSimpleSwapPoolInfo();

  const reserveA = poolData?.[0] || 0n;
  const reserveB = poolData?.[1] || 0n;

  const isTokenAFirst =
    tokenA.address.toLowerCase() === TOKENS.KAIZEN.address.toLowerCase();
  const tokenAReserve = isTokenAFirst ? reserveA : reserveB;
  const tokenBReserve = isTokenAFirst ? reserveB : reserveA;

  const oneTokenAmount = parseTokenAmount("1", tokenA.decimals);
  const { data: priceAtoB } = useAmountOut(
    oneTokenAmount,
    tokenAReserve,
    tokenBReserve
  );

  const oneTokenBAmount = parseTokenAmount("1", tokenB.decimals);
  const { data: priceBtoA } = useAmountOut(
    oneTokenBAmount,
    tokenBReserve,
    tokenAReserve
  );

  const formatPrice = (price: bigint | undefined, decimals: number): string => {
    if (!price) return "0";
    return parseFloat(formatTokenAmount(price, decimals)).toFixed(6);
  };

  const priceAToBFormatted = formatPrice(priceAtoB, tokenB.decimals);
  const priceBToAFormatted = formatPrice(priceBtoA, tokenA.decimals);

  const displayTokenA = isFlipped ? tokenB : tokenA;
  const displayTokenB = isFlipped ? tokenA : tokenB;
  const displayPrice = isFlipped ? priceBToAFormatted : priceAToBFormatted;

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-400/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Price Information
        </h3>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-1 rounded-lg hover:bg-cyan-500/10 transition-colors"
        >
          <ArrowRightLeft className="h-4 w-4 text-gray-400 hover:text-cyan-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">1 {displayTokenA.symbol}</span>
            <span className="text-gray-500">=</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-white">
              {displayPrice}
            </span>
            <span className="text-gray-400 ml-1">{displayTokenB.symbol}</span>
          </div>
        </div>

        {poolData && reserveA > 0n && reserveB > 0n && (
          <div className="border-t border-gray-700/50 pt-3 space-y-2">
            <div className="text-xs text-gray-500 mb-2">Pool Reserves</div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">{tokenA.symbol}</span>
              <span className="text-xs text-cyan-300 font-mono">
                {formatTokenAmount(reserveA, tokenA.decimals)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">{tokenB.symbol}</span>
              <span className="text-xs text-pink-300 font-mono">
                {formatTokenAmount(reserveB, tokenB.decimals)}
              </span>
            </div>
          </div>
        )}

        <div className="border-t border-gray-700/50 pt-3 space-y-1">
          <div className="text-xs text-gray-500 mb-2">Exchange Rates</div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">
              1 {tokenA.symbol} → {tokenB.symbol}
            </span>
            <span className="text-cyan-300 font-mono">
              {priceAToBFormatted}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">
              1 {tokenB.symbol} → {tokenA.symbol}
            </span>
            <span className="text-pink-300 font-mono">
              {priceBToAFormatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
