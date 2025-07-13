"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Plus, Minus, Info } from "lucide-react";

import { TOKENS, CONTRACTS } from "@/types/contracts";
import { SIMPLE_SWAP_ABI } from "@/lib/contractABI";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
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
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { TransactionFailureDetector } from "@/components/TransactionFailureDetector";

type TabType = "add" | "remove";

export function SimpleLiquidityComponent() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("add");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [liquidityToRemove, setLiquidityToRemove] = useState("");
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  const [detectedFailureReason, setDetectedFailureReason] = useState<
    string | null
  >(null);

  const tokenA = TOKENS.KAIZEN;
  const tokenB = TOKENS.YUREI;

  // Contract reads
  const { data: poolInfo } = useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getPoolInfo",
    query: {
      staleTime: 30000,
    },
  });

  const { data: balanceA } = useTokenBalance(tokenA.address, address);
  const { data: balanceB } = useTokenBalance(tokenB.address, address);
  const { data: allowanceA } = useTokenAllowance(
    tokenA.address,
    address,
    CONTRACTS.SIMPLE_SWAP
  );
  const { data: allowanceB } = useTokenAllowance(
    tokenB.address,
    address,
    CONTRACTS.SIMPLE_SWAP
  );

  const { data: liquidityBalance } = useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getLiquidityBalance",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      staleTime: 30000,
    },
  });

  const reserveA = poolInfo?.[0] || 0n;
  const reserveB = poolInfo?.[1] || 0n;
  const totalSupply = poolInfo?.[2] || 0n;

  const amountAWei = amountA ? parseTokenAmount(amountA, tokenA.decimals) : 0n;
  const amountBWei = amountB ? parseTokenAmount(amountB, tokenB.decimals) : 0n;
  const liquidityWei = liquidityToRemove
    ? parseTokenAmount(liquidityToRemove, 18)
    : 0n;

  const {
    approve: approveA,
    isPending: isApprovingA,
    isConfirming: isApprovingAConfirming,
    isConfirmed: isApprovalAConfirmed,
    hash: approveAHash,
    error: approveAError,
  } = useTokenApproval();
  const {
    approve: approveB,
    isPending: isApprovingB,
    isConfirming: isApprovingBConfirming,
    isConfirmed: isApprovalBConfirmed,
    hash: approveBHash,
    error: approveBError,
  } = useTokenApproval();

  const {
    writeContract: addLiquidity,
    data: addLiquidityHash,
    isPending: isAddingLiquidity,
    error: addError,
  } = useWriteContract();

  const {
    writeContract: removeLiquidity,
    data: removeLiquidityHash,
    isPending: isRemovingLiquidity,
    error: removeError,
  } = useWriteContract();

  // Transaction status tracking
  const {
    isLoading: isAddConfirming,
    isSuccess: isAddConfirmed,
    error: addConfirmError,
  } = useWaitForTransactionReceipt({
    hash: addLiquidityHash,
  });

  const {
    isLoading: isRemoveConfirming,
    isSuccess: isRemoveConfirmed,
    error: removeConfirmError,
  } = useWaitForTransactionReceipt({
    hash: removeLiquidityHash,
  });

  const needsApprovalA =
    allowanceA !== undefined &&
    allowanceA !== null &&
    amountAWei > (allowanceA as bigint);
  const needsApprovalB =
    allowanceB !== undefined &&
    allowanceB !== null &&
    amountBWei > (allowanceB as bigint);
  const hasInsufficientBalanceA =
    balanceA !== undefined &&
    balanceA !== null &&
    amountAWei > (balanceA as bigint);
  const hasInsufficientBalanceB =
    balanceB !== undefined &&
    balanceB !== null &&
    amountBWei > (balanceB as bigint);
  const hasInsufficientLiquidity =
    liquidityBalance !== undefined &&
    liquidityBalance !== null &&
    liquidityWei > (liquidityBalance as bigint);

  // Auto-calculate optimal amounts when one input changes
  useEffect(() => {
    const calculateOptimalAmountB = (inputAmountA: string) => {
      if (!inputAmountA || reserveA === 0n) return "";
      const amountAWei = parseTokenAmount(inputAmountA, tokenA.decimals);
      const optimalAmountBWei = (amountAWei * reserveB) / reserveA;
      return formatTokenAmount(optimalAmountBWei, tokenB.decimals, 6);
    };

    const calculateOptimalAmountA = (inputAmountB: string) => {
      if (!inputAmountB || reserveB === 0n) return "";
      const amountBWei = parseTokenAmount(inputAmountB, tokenB.decimals);
      const optimalAmountAWei = (amountBWei * reserveA) / reserveB;
      return formatTokenAmount(optimalAmountAWei, tokenA.decimals, 6);
    };

    if (activeTab === "add" && reserveA > 0n && reserveB > 0n) {
      if (amountA && !amountB) {
        setAmountB(calculateOptimalAmountB(amountA));
      } else if (amountB && !amountA) {
        setAmountA(calculateOptimalAmountA(amountB));
      }
    }
  }, [
    amountA,
    amountB,
    reserveA,
    reserveB,
    activeTab,
    tokenA.decimals,
    tokenB.decimals,
  ]);

  useEffect(() => {
    if (isAddConfirmed) {
      setAmountA("");
      setAmountB("");
    }
    if (isRemoveConfirmed) {
      setLiquidityToRemove("");
    }
  }, [isAddConfirmed, isRemoveConfirmed]);

  useEffect(() => {
    if (isAddingLiquidity || isRemovingLiquidity) {
      setDetectedFailureReason(null);
    }
  }, [isAddingLiquidity, isRemovingLiquidity]);

  const handleApproveA = () => {
    if (!amountAWei) return;
    approveA(tokenA.address, CONTRACTS.SIMPLE_SWAP, amountAWei * 2n);
  };

  const handleApproveB = () => {
    if (!amountBWei) return;
    approveB(tokenB.address, CONTRACTS.SIMPLE_SWAP, amountBWei * 2n);
  };

  const handleAddLiquidity = () => {
    if (!address || !amountAWei || !amountBWei) return;

    const amountAMin = calculateSlippage(amountAWei, slippage);
    const amountBMin = calculateSlippage(amountBWei, slippage);
    const deadline = getDeadline(20);

    console.log("🔍 Add Liquidity Debug Info:", {
      tokenA: tokenA.address,
      tokenB: tokenB.address,
      amountADesired: amountAWei.toString(),
      amountBDesired: amountBWei.toString(),
      amountAMin: amountAMin.toString(),
      amountBMin: amountBMin.toString(),
      to: address,
      deadline: deadline.toString(),
      currentReserves: {
        reserveA: reserveA.toString(),
        reserveB: reserveB.toString(),
        totalSupply: totalSupply.toString(),
      },
    });

    addLiquidity({
      address: CONTRACTS.SIMPLE_SWAP,
      abi: SIMPLE_SWAP_ABI,
      functionName: "addLiquidity",
      args: [
        tokenA.address,
        tokenB.address,
        amountAWei,
        amountBWei,
        amountAMin,
        amountBMin,
        address,
        deadline,
      ],
    });
  };

  const handleRemoveLiquidity = () => {
    if (!address || !liquidityWei) return;

    const amountAMin = 0n;
    const amountBMin = 0n;
    const deadline = getDeadline(20);

    removeLiquidity({
      address: CONTRACTS.SIMPLE_SWAP,
      abi: SIMPLE_SWAP_ABI,
      functionName: "removeLiquidity",
      args: [
        tokenA.address,
        tokenB.address,
        liquidityWei,
        amountAMin,
        amountBMin,
        address,
        deadline,
      ],
    });
  };

  const poolExists = reserveA > 0n || reserveB > 0n;
  const isFirstProvider = !poolExists;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "add"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Plus className="h-4 w-4 inline mr-1" />
            Add Liquidity
          </button>
          <button
            onClick={() => setActiveTab("remove")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "remove"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Minus className="h-4 w-4 inline mr-1" />
            Remove Liquidity
          </button>
        </div>
      </div>

      {activeTab === "add" ? (
        <div className="space-y-4">
          {isFirstProvider && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Info className="h-4 w-4" />
                First Liquidity Provider
              </div>
              <div className="text-sm text-blue-700">
                You&apos;ll be the first to add liquidity! You can set any ratio
                - this establishes the initial price.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {tokenA.symbol}
              </label>
              {balanceA !== undefined && balanceA !== null && (
                <span className="text-xs text-gray-500">
                  Balance:{" "}
                  {formatTokenAmount(balanceA as bigint, tokenA.decimals)}
                </span>
              )}
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
            />
            {hasInsufficientBalanceA && (
              <p className="text-xs text-red-500">Insufficient balance</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {tokenB.symbol}
              </label>
              {balanceB !== undefined && balanceB !== null && (
                <span className="text-xs text-gray-500">
                  Balance:{" "}
                  {formatTokenAmount(balanceB as bigint, tokenB.decimals)}
                </span>
              )}
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
            />
            {hasInsufficientBalanceB && (
              <p className="text-xs text-red-500">Insufficient balance</p>
            )}
          </div>

          {/* Pool Info */}
          {poolExists && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                <div>
                  Reserve {tokenA.symbol}:{" "}
                  {formatTokenAmount(reserveA, tokenA.decimals)}
                </div>
                <div>
                  Reserve {tokenB.symbol}:{" "}
                  {formatTokenAmount(reserveB, tokenB.decimals)}
                </div>
                <div>Total Supply: {formatTokenAmount(totalSupply, 18)}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {!address ? (
              <Button disabled className="w-full">
                Connect Wallet
              </Button>
            ) : needsApprovalA ? (
              <Button
                onClick={handleApproveA}
                disabled={isApprovingA}
                className="w-full"
              >
                {isApprovingA ? "Approving..." : `Approve ${tokenA.symbol}`}
              </Button>
            ) : needsApprovalB ? (
              <Button
                onClick={handleApproveB}
                disabled={isApprovingB}
                className="w-full"
              >
                {isApprovingB ? "Approving..." : `Approve ${tokenB.symbol}`}
              </Button>
            ) : (
              <Button
                onClick={handleAddLiquidity}
                disabled={
                  isAddingLiquidity ||
                  !amountA ||
                  !amountB ||
                  hasInsufficientBalanceA ||
                  hasInsufficientBalanceB
                }
                className="w-full"
              >
                {isAddingLiquidity ? "Adding Liquidity..." : "Add Liquidity"}
              </Button>
            )}
          </div>

          {(needsApprovalA ||
            isApprovingA ||
            isApprovalAConfirmed ||
            approveAError) && (
            <TransactionStatus
              hash={approveAHash}
              error={approveAError}
              isPending={isApprovingA}
              isConfirming={isApprovingAConfirming}
              isConfirmed={isApprovalAConfirmed}
              successMessage={`${tokenA.symbol} approved successfully!`}
              pendingMessage={`Approving ${tokenA.symbol}...`}
              confirmingMessage={`Confirming ${tokenA.symbol} approval...`}
            />
          )}

          {(needsApprovalB ||
            isApprovingB ||
            isApprovalBConfirmed ||
            approveBError) && (
            <TransactionStatus
              hash={approveBHash}
              error={approveBError}
              isPending={isApprovingB}
              isConfirming={isApprovingBConfirming}
              isConfirmed={isApprovalBConfirmed}
              successMessage={`${tokenB.symbol} approved successfully!`}
              pendingMessage={`Approving ${tokenB.symbol}...`}
              confirmingMessage={`Confirming ${tokenB.symbol} approval...`}
            />
          )}

          {(addLiquidityHash ||
            addError ||
            isAddingLiquidity ||
            isAddConfirming ||
            isAddConfirmed ||
            detectedFailureReason) && (
            <>
              <TransactionStatus
                hash={addLiquidityHash}
                error={
                  addError ||
                  addConfirmError ||
                  (detectedFailureReason
                    ? new Error(detectedFailureReason)
                    : null)
                }
                isPending={isAddingLiquidity}
                isConfirming={isAddConfirming}
                isConfirmed={isAddConfirmed}
                successMessage="Liquidity added successfully!"
                pendingMessage="Adding liquidity..."
                confirmingMessage="Confirming liquidity addition..."
              />

              {/* Failure Detector */}
              {addLiquidityHash && (
                <TransactionFailureDetector
                  hash={addLiquidityHash}
                  onFailureDetected={(reason) => {
                    console.log("🔴 Failure detected:", reason);
                    setDetectedFailureReason(reason);
                  }}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {liquidityBalance !== undefined && liquidityBalance !== null && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                Your Liquidity:{" "}
                {formatTokenAmount(liquidityBalance as bigint, 18)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Liquidity to Remove
            </label>
            <Input
              type="number"
              placeholder="0.0"
              value={liquidityToRemove}
              onChange={(e) => setLiquidityToRemove(e.target.value)}
            />
            {hasInsufficientLiquidity && (
              <p className="text-xs text-red-500">Insufficient liquidity</p>
            )}
          </div>

          <div className="pt-4">
            {!address ? (
              <Button disabled className="w-full">
                Connect Wallet
              </Button>
            ) : (
              <Button
                onClick={handleRemoveLiquidity}
                disabled={
                  isRemovingLiquidity ||
                  !liquidityToRemove ||
                  hasInsufficientLiquidity
                }
                className="w-full"
                variant="destructive"
              >
                {isRemovingLiquidity
                  ? "Removing Liquidity..."
                  : "Remove Liquidity"}
              </Button>
            )}
          </div>

          {(removeLiquidityHash ||
            removeError ||
            isRemovingLiquidity ||
            isRemoveConfirming ||
            isRemoveConfirmed) && (
            <TransactionStatus
              hash={removeLiquidityHash}
              error={removeError || removeConfirmError}
              isPending={isRemovingLiquidity}
              isConfirming={isRemoveConfirming}
              isConfirmed={isRemoveConfirmed}
              successMessage="Liquidity removed successfully!"
              pendingMessage="Removing liquidity..."
              confirmingMessage="Confirming liquidity removal..."
            />
          )}
        </div>
      )}

      <div className="space-y-2 mt-6 pt-4 border-t border-gray-200">
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

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">🔍 Debug Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Pool Exists:</span>
            <span className={poolExists ? "text-green-600" : "text-red-600"}>
              {poolExists ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Reserve A:</span>
            <span className="font-mono text-xs">{reserveA.toString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Reserve B:</span>
            <span className="font-mono text-xs">{reserveB.toString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Supply:</span>
            <span className="font-mono text-xs">{totalSupply.toString()}</span>
          </div>
          {liquidityBalance !== undefined && (
            <div className="flex justify-between">
              <span>Your Liquidity:</span>
              <span className="font-mono text-xs">
                {liquidityBalance.toString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
