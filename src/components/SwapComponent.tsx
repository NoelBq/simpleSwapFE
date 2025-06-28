"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ArrowUpDown, Settings } from "lucide-react";
import { type Address } from "viem";

import { TOKENS, CONTRACTS, type Token } from "@/types/contracts";
import {
  usePoolInfo,
  useAmountOut,
  useSwapTokens,
} from "@/hooks/useSimpleSwap";
import {
  useTokenBalance,
  useTokenAllowance,
  useTokenApproval,
} from "@/hooks/useToken";
import {
  parseTokenAmount,
  formatTokenAmount,
  getDeadline,
  calculateSlippage,
} from "@/lib/utils";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TokenSelector } from "@/components/TokenSelector";
import { TransactionStatus } from "@/components/ui/TransactionStatus";

export function SwapComponent() {
  const { address } = useAccount();
  const [fromToken, setFromToken] = useState<Token>(TOKENS.KAIZEN);
  const [toToken, setToToken] = useState<Token>(TOKENS.YUREI);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5); // 0.5%

  // Contract reads
  const { data: poolInfo } = usePoolInfo(fromToken.address, toToken.address);
  const { data: fromBalance } = useTokenBalance(fromToken.address, address);
  const { data: allowance } = useTokenAllowance(
    fromToken.address,
    address,
    CONTRACTS.SIMPLE_SWAP
  );

  const amountInWei = fromAmount
    ? parseTokenAmount(fromAmount, fromToken.decimals)
    : 0n;
  const { data: amountOutWei } = useAmountOut(
    amountInWei,
    poolInfo?.[0] || 0n, // reserveA
    poolInfo?.[1] || 0n // reserveB
  );

  // Contract writes
  const {
    approve,
    isPending: isApproving,
    isConfirming: isApproveConfirming,
    isConfirmed: isApproveConfirmed,
    hash: approveHash,
    error: approveError,
  } = useTokenApproval();
  const {
    swapTokens,
    isPending: isSwapping,
    isConfirming: isSwapConfirming,
    isConfirmed: isSwapConfirmed,
    hash: swapHash,
    error: swapError,
  } = useSwapTokens();

  const needsApproval =
    allowance !== undefined &&
    allowance !== null &&
    amountInWei > (allowance as bigint);
  const amountOut = amountOutWei
    ? formatTokenAmount(amountOutWei, toToken.decimals)
    : "0";
  const hasInsufficientBalance =
    fromBalance !== undefined &&
    fromBalance !== null &&
    amountInWei > (fromBalance as bigint);

  const handleApprove = () => {
    if (!amountInWei) return;
    approve(fromToken.address, CONTRACTS.SIMPLE_SWAP, amountInWei * 2n); // Approve 2x for future trades
  };

  const handleSwap = () => {
    if (!address || !amountInWei || !amountOutWei) return;

    const amountOutMin = calculateSlippage(amountOutWei, slippage);
    const deadline = getDeadline(20); // 20 minutes

    swapTokens({
      amountIn: amountInWei,
      amountOutMin,
      path: [fromToken.address, toToken.address],
      to: address,
      deadline,
    });
  };

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
  };

  // Reset amount when tokens change
  useEffect(() => {
    setFromAmount("");
  }, [fromToken, toToken]);

  // Reset form after successful swap
  useEffect(() => {
    if (isSwapConfirmed) {
      setFromAmount("");
    }
  }, [isSwapConfirmed]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Swap Tokens</h2>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">From</label>
            {fromBalance !== undefined && fromBalance !== null && (
              <span className="text-xs text-gray-500">
                Balance:{" "}
                {formatTokenAmount(fromBalance as bigint, fromToken.decimals)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
            />
            <TokenSelector
              selectedToken={fromToken}
              onTokenSelect={setFromToken}
            />
          </div>
          {hasInsufficientBalance && (
            <p className="text-xs text-red-500">Insufficient balance</p>
          )}
        </div>

        {/* Flip Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFlipTokens}
            className="rounded-full border-2 border-gray-200"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amountOut}
              disabled
              className="flex-1"
            />
            <TokenSelector selectedToken={toToken} onTokenSelect={setToToken} />
          </div>
        </div>

        {/* Slippage */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Slippage Tolerance: {slippage}%
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {!address ? (
            <Button disabled className="w-full">
              Connect Wallet
            </Button>
          ) : needsApproval ? (
            <Button
              onClick={handleApprove}
              disabled={isApproving || !fromAmount}
              className="w-full"
            >
              {isApproving ? "Approving..." : `Approve ${fromToken.symbol}`}
            </Button>
          ) : (
            <Button
              onClick={handleSwap}
              disabled={
                isSwapping ||
                !fromAmount ||
                hasInsufficientBalance ||
                !amountOutWei
              }
              className="w-full"
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </Button>
          )}
        </div>

        {/* Approval Transaction Status */}
        {(needsApproval ||
          isApproving ||
          isApproveConfirmed ||
          approveError) && (
          <TransactionStatus
            hash={approveHash}
            error={approveError}
            isPending={isApproving}
            isConfirming={isApproveConfirming}
            isConfirmed={isApproveConfirmed}
            successMessage={`${fromToken.symbol} approved successfully!`}
            pendingMessage={`Approving ${fromToken.symbol}...`}
            confirmingMessage={`Confirming ${fromToken.symbol} approval...`}
          />
        )}

        {/* Transaction Status */}
        <TransactionStatus
          hash={swapHash}
          error={swapError}
          isPending={isSwapping}
          isConfirming={isSwapConfirming}
          isConfirmed={isSwapConfirmed}
          successMessage="Swap successful!"
          pendingMessage="Swapping tokens..."
          confirmingMessage="Confirming swap..."
        />
      </div>
    </div>
  );
}
