"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Plus, Minus } from "lucide-react";

import { TOKENS, CONTRACTS, type Token } from "@/types/contracts";
import {
  usePoolInfo,
  useAddLiquidity,
  useRemoveLiquidity,
  useLiquidityBalance,
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
// import { LiquidityDiagnostics } from "@/components/LiquidityDiagnostics";
import { TransactionFailureDetector } from "@/components/TransactionFailureDetector";
import { WagmiDebug } from "@/components/WagmiDebug";
import { ContractReadTest } from "@/components/ContractReadTest";

type TabType = "add" | "remove";

export function LiquidityComponent() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("add");
  const [tokenA, setTokenA] = useState<Token>(TOKENS.KAIZEN);
  const [tokenB, setTokenB] = useState<Token>(TOKENS.YUREI);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [liquidityToRemove, setLiquidityToRemove] = useState("");
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  const [detectedFailureReason, setDetectedFailureReason] = useState<
    string | null
  >(null);

  // Contract reads
  const { data: poolInfo } = usePoolInfo(tokenA.address, tokenB.address);
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
  const { data: liquidityBalance } = useLiquidityBalance(
    address,
    tokenA.address,
    tokenB.address
  );

  // Debug logging
  useEffect(() => {
    console.log("🔍 Debug - Query Data:", {
      address,
      tokenA: tokenA.address,
      tokenB: tokenB.address,
      balanceA,
      balanceB,
      allowanceA,
      allowanceB,
      poolInfo,
      liquidityBalance,
    });
  }, [
    address,
    tokenA.address,
    tokenB.address,
    balanceA,
    balanceB,
    allowanceA,
    allowanceB,
    poolInfo,
    liquidityBalance,
  ]);

  const amountAWei = amountA ? parseTokenAmount(amountA, tokenA.decimals) : 0n;
  const amountBWei = amountB ? parseTokenAmount(amountB, tokenB.decimals) : 0n;
  const liquidityWei = liquidityToRemove
    ? parseTokenAmount(liquidityToRemove, 18)
    : 0n;

  // Contract writes
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
    addLiquidity,
    isPending: isAddingLiquidity,
    isConfirming: isAddConfirming,
    isConfirmed: isAddConfirmed,
    hash: addLiquidityHash,
    error: addError,
    isReverted: isAddReverted,
  } = useAddLiquidity();
  const {
    removeLiquidity,
    isPending: isRemovingLiquidity,
    isConfirming: isRemoveConfirming,
    isConfirmed: isRemoveConfirmed,
    hash: removeLiquidityHash,
    error: removeError,
  } = useRemoveLiquidity();

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
      if (!inputAmountA || !poolInfo || poolInfo[0] === 0n) return "";
      const amountAWei = parseTokenAmount(inputAmountA, tokenA.decimals);
      const optimalAmountBWei = (amountAWei * poolInfo[1]) / poolInfo[0];
      return formatTokenAmount(optimalAmountBWei, tokenB.decimals, 6);
    };

    const calculateOptimalAmountA = (inputAmountB: string) => {
      if (!inputAmountB || !poolInfo || poolInfo[1] === 0n) return "";
      const amountBWei = parseTokenAmount(inputAmountB, tokenB.decimals);
      const optimalAmountAWei = (amountBWei * poolInfo[0]) / poolInfo[1];
      return formatTokenAmount(optimalAmountAWei, tokenA.decimals, 6);
    };

    if (
      activeTab === "add" &&
      poolInfo &&
      poolInfo[0] > 0n &&
      poolInfo[1] > 0n
    ) {
      // Only auto-calculate if one field is empty
      if (amountA && !amountB) {
        setAmountB(calculateOptimalAmountB(amountA));
      } else if (amountB && !amountA) {
        setAmountA(calculateOptimalAmountA(amountB));
      }
    }
  }, [amountA, amountB, poolInfo, activeTab, tokenA.decimals, tokenB.decimals]);

  // Reset form after successful transactions
  // Reset form after successful transactions
  useEffect(() => {
    if (isAddConfirmed) {
      setAmountA("");
      setAmountB("");
    }
    if (isRemoveConfirmed) {
      setLiquidityToRemove("");
    }
  }, [isAddConfirmed, isRemoveConfirmed]);

  // Clear detected failure reason when starting new transactions
  useEffect(() => {
    if (isAddingLiquidity || isRemovingLiquidity) {
      setDetectedFailureReason(null);
    }
  }, [isAddingLiquidity, isRemovingLiquidity]);

  // Handler functions
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

    // Debug logging to identify potential issues
    console.log("🔍 Add Liquidity Debug Info:", {
      currentTime: new Date().toISOString(),
      currentTimestamp: Math.floor(Date.now() / 1000),
      deadline: deadline.toString(),
      deadlineDate: new Date(Number(deadline) * 1000).toISOString(),
      isDeadlineValid: Number(deadline) > Math.floor(Date.now() / 1000),
      tokenA: tokenA.symbol,
      tokenB: tokenB.symbol,
      amountADesired: amountAWei.toString(),
      amountBDesired: amountBWei.toString(),
      amountAMin: amountAMin.toString(),
      amountBMin: amountBMin.toString(),
      slippagePercent: slippage,
      userBalance: {
        tokenA: balanceA?.toString(),
        tokenB: balanceB?.toString(),
      },
      allowances: {
        tokenA: allowanceA?.toString(),
        tokenB: allowanceB?.toString(),
      },
      poolReserves: poolInfo
        ? {
            reserveA: poolInfo[0].toString(),
            reserveB: poolInfo[1].toString(),
            totalSupply: poolInfo[2].toString(),
          }
        : "No pool info",
    });

    addLiquidity({
      tokenA: tokenA.address,
      tokenB: tokenB.address,
      amountADesired: amountAWei,
      amountBDesired: amountBWei,
      amountAMin,
      amountBMin,
      to: address,
      deadline,
    });
  };

  const handleRemoveLiquidity = () => {
    if (!address || !liquidityWei) return;

    // Calculate minimum amounts (with slippage protection)
    const amountAMin = 0n; // Could calculate based on current pool ratio
    const amountBMin = 0n; // Could calculate based on current pool ratio
    const deadline = getDeadline(20);

    removeLiquidity({
      tokenA: tokenA.address,
      tokenB: tokenB.address,
      liquidity: liquidityWei,
      amountAMin,
      amountBMin,
      to: address,
      deadline,
    });
  };

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
          {/* Token A */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Token A
              </label>
              {balanceA !== undefined && balanceA !== null && (
                <span className="text-xs text-gray-500">
                  Balance:{" "}
                  {formatTokenAmount(balanceA as bigint, tokenA.decimals)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="flex-1"
              />
              <TokenSelector selectedToken={tokenA} onTokenSelect={setTokenA} />
            </div>
            {hasInsufficientBalanceA && (
              <p className="text-xs text-red-500">Insufficient balance</p>
            )}
          </div>

          {/* Token B */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Token B
              </label>
              {balanceB !== undefined && balanceB !== null && (
                <span className="text-xs text-gray-500">
                  Balance:{" "}
                  {formatTokenAmount(balanceB as bigint, tokenB.decimals)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="flex-1"
              />
              <TokenSelector selectedToken={tokenB} onTokenSelect={setTokenB} />
            </div>
            {hasInsufficientBalanceB && (
              <p className="text-xs text-red-500">Insufficient balance</p>
            )}
          </div>

          {/* Pool Info */}
          {poolInfo && poolInfo[0] > 0n && poolInfo[1] > 0n && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                <div>
                  Reserve {tokenA.symbol}:{" "}
                  {formatTokenAmount(poolInfo[0], tokenA.decimals)}
                </div>
                <div>
                  Reserve {tokenB.symbol}:{" "}
                  {formatTokenAmount(poolInfo[1], tokenB.decimals)}
                </div>
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

          {/* Approval Transaction Status */}
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

          {/* Transaction Status for Add Liquidity */}
          {(addLiquidityHash ||
            addError ||
            isAddingLiquidity ||
            isAddConfirming ||
            isAddConfirmed ||
            isAddReverted ||
            detectedFailureReason) && (
            <>
              <TransactionStatus
                hash={addLiquidityHash}
                error={
                  addError ||
                  (isAddReverted
                    ? new Error(
                        detectedFailureReason ||
                          "Transaction failed: execution reverted"
                      )
                    : detectedFailureReason
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
              <TransactionFailureDetector
                hash={addLiquidityHash}
                onFailureDetected={(reason) => {
                  console.log("🔴 Failure detected:", reason);
                  setDetectedFailureReason(reason);
                }}
              />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Liquidity Balance */}
          {liquidityBalance !== undefined && liquidityBalance !== null && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                Your Liquidity:{" "}
                {formatTokenAmount(liquidityBalance as bigint, 18)}
              </div>
            </div>
          )}

          {/* Liquidity Amount */}
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

          {/* Action Button */}
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

          {/* Transaction Status for Remove Liquidity */}
          <TransactionStatus
            hash={removeLiquidityHash}
            error={removeError}
            isPending={isRemovingLiquidity}
            isConfirming={isRemoveConfirming}
            isConfirmed={isRemoveConfirmed}
            successMessage="Liquidity removed successfully!"
            pendingMessage="Removing liquidity..."
            confirmingMessage="Confirming liquidity removal..."
          />
        </div>
      )}

      {/* Slippage */}
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

      {/* Simple Debug Info */}
      <WagmiDebug />
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">🔍 Debug Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Wallet Connected:</span>
            <span className={address ? "text-green-600" : "text-red-600"}>
              {address ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          {address && (
            <>
              <div className="flex justify-between">
                <span>Your Address:</span>
                <span className="font-mono text-xs">{address}</span>
              </div>
              <div className="flex justify-between">
                <span>KAIZEN Balance Raw:</span>
                <span className="font-mono text-xs">
                  {balanceA === undefined
                    ? "undefined"
                    : balanceA === null
                    ? "null"
                    : balanceA.toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ETH Balance Raw:</span>
                <span className="font-mono text-xs">
                  {balanceB === undefined
                    ? "undefined"
                    : balanceB === null
                    ? "null"
                    : balanceB.toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>KAIZEN Allowance Raw:</span>
                <span className="font-mono text-xs">
                  {allowanceA === undefined
                    ? "undefined"
                    : allowanceA === null
                    ? "null"
                    : allowanceA.toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ETH Allowance Raw:</span>
                <span className="font-mono text-xs">
                  {allowanceB === undefined
                    ? "undefined"
                    : allowanceB === null
                    ? "null"
                    : allowanceB.toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pool Info Raw:</span>
                <span className="font-mono text-xs">
                  {poolInfo === undefined
                    ? "undefined"
                    : poolInfo === null
                    ? "null"
                    : `[${poolInfo[0]?.toString()}, ${poolInfo[1]?.toString()}, ${poolInfo[2]?.toString()}]`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
