"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ArrowUpDown, Settings } from "lucide-react";

import { TOKENS, CONTRACTS, type Token } from "@/types/contracts";
import { useAmountOut, useSwapTokens } from "@/hooks/useSimpleSwap";
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
import { SIMPLE_SWAP_ABI } from "@/lib/contractABI";
import { useReadContract } from "wagmi";

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

  // Contract reads - poolInfo only
  const {
    data: poolInfoRaw,
    isLoading: poolLoading,
    error: poolError,
  } = useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getPoolInfo",
    query: {
      staleTime: 30000,
    },
  });
  // Type guard: ensure poolInfo is array before indexing
  const poolInfo = Array.isArray(poolInfoRaw) ? poolInfoRaw : undefined;
  const { data: fromBalance } = useTokenBalance(fromToken.address, address);
  const { data: allowance } = useTokenAllowance(
    fromToken.address,
    address,
    CONTRACTS.SIMPLE_SWAP
  );

  // Extract reserves from pool info
  const reserveA = poolInfo?.[0] ?? 0n;
  const reserveB = poolInfo?.[1] ?? 0n;

  useEffect(() => {
    console.log("SwapComponent Debug:", {
      poolInfo,
      poolLoading,
      poolError,
      reserveA: reserveA.toString(),
      reserveB: reserveB.toString(),
      hasPoolData: !!poolInfo,
      dataSource: poolInfo ? "getPoolInfo" : "none",
    });
  }, [poolInfo, poolLoading, poolError, reserveA, reserveB]);

  const isFromTokenA =
    fromToken.address.toLowerCase() === TOKENS.KAIZEN.address.toLowerCase();
  const fromReserve = isFromTokenA ? reserveA : reserveB;
  const toReserve = isFromTokenA ? reserveB : reserveA;

  const amountInWei = fromAmount
    ? parseTokenAmount(fromAmount, fromToken.decimals)
    : 0n;
  const { data: amountOutWei, isLoading: amountOutLoading } = useAmountOut(
    amountInWei,
    fromReserve,
    toReserve
  );

  useEffect(() => {
    if (fromAmount && amountInWei > 0n) {
      console.log("Amount Out Debug:", {
        fromAmount,
        amountInWei: amountInWei.toString(),
        fromReserve: fromReserve.toString(),
        toReserve: toReserve.toString(),
        amountOutWei: amountOutWei?.toString(),
        amountOutLoading,
        canCalculate: fromReserve > 0n && toReserve > 0n,
      });
    }
  }, [
    fromAmount,
    amountInWei,
    fromReserve,
    toReserve,
    amountOutWei,
    amountOutLoading,
  ]);

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
    : poolLoading || amountOutLoading
    ? "Loading..."
    : fromAmount && fromReserve > 0n && toReserve > 0n
    ? "0"
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
    const deadline = getDeadline(20);

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
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 relative">
      {poolLoading && !poolInfo && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <div className="text-cyan-700 font-semibold text-lg">
            Loading pool data...
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Swap Tokens</h2>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">To</label>
            {poolLoading && (
              <span className="text-xs text-blue-500">
                Loading pool data...
              </span>
            )}
          </div>
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
