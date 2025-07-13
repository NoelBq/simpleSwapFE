"use client";

import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { type Token, TOKENS } from "@/types/contracts";
import { useSimpleSwapPoolInfo, useAmountOut } from "@/hooks/useSimpleSwap";
import { formatTokenAmount, parseTokenAmount } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PriceCalculator() {
  const [amount, setAmount] = useState("");
  const [fromToken, setFromToken] = useState<Token>(TOKENS.KAIZEN);
  const [toToken, setToToken] = useState<Token>(TOKENS.YUREI);

  const { data: poolData } = useSimpleSwapPoolInfo();

  const reserveA = poolData?.[0] || 0n;
  const reserveB = poolData?.[1] || 0n;

  const isFromTokenA =
    fromToken.address.toLowerCase() === TOKENS.KAIZEN.address.toLowerCase();
  const fromReserve = isFromTokenA ? reserveA : reserveB;
  const toReserve = isFromTokenA ? reserveB : reserveA;

  const amountInWei = amount
    ? parseTokenAmount(amount, fromToken.decimals)
    : 0n;

  const { data: amountOutWei } = useAmountOut(
    amountInWei,
    fromReserve,
    toReserve
  );

  const amountOut = amountOutWei
    ? formatTokenAmount(amountOutWei, toToken.decimals)
    : "0";

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount("");
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-medium text-purple-300">
          Price Calculator
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {/* Input Amount */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Amount</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-black/30 border-gray-600/30 text-white placeholder-gray-500"
              />
              <button
                onClick={() =>
                  setFromToken(
                    fromToken === TOKENS.KAIZEN ? TOKENS.YUREI : TOKENS.KAIZEN
                  )
                }
                className="px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors text-sm"
              >
                {fromToken.symbol}
              </button>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <Button
              onClick={handleFlip}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-purple-500/20 border border-purple-500/20 rounded-full"
            >
              <ArrowRight className="h-4 w-4 text-purple-400" />
            </Button>
          </div>

          {/* Output Amount */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">You will receive</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/30 border border-gray-600/30 rounded-lg px-3 py-2">
                <span className="text-white font-mono">
                  {parseFloat(amountOut).toFixed(6)}
                </span>
              </div>
              <button
                onClick={() =>
                  setToToken(
                    toToken === TOKENS.KAIZEN ? TOKENS.YUREI : TOKENS.KAIZEN
                  )
                }
                className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm"
              >
                {toToken.symbol}
              </button>
            </div>
          </div>
        </div>

        {/* Price Impact */}
        {amount && parseFloat(amount) > 0 && (
          <div className="border-t border-gray-700/50 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Exchange Rate</span>
              <span className="text-gray-300">
                1 {fromToken.symbol} ={" "}
                {amountOutWei && amount
                  ? (parseFloat(amountOut) / parseFloat(amount)).toFixed(6)
                  : "0"}{" "}
                {toToken.symbol}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
