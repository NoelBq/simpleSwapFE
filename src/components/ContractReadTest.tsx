"use client";

import { useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { TOKENS, ERC20_ABI } from "@/types/contracts";

export function ContractReadTest() {
  const { address } = useAccount();

  // Simple contract read without conditions
  const {
    data: kaizenSymbol,
    isLoading: isLoadingSymbol,
    error: symbolError,
  } = useReadContract({
    address: TOKENS.KAIZEN.address,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  // Contract read with address condition
  const {
    data: kaizenBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useReadContract({
    address: TOKENS.KAIZEN.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  // Contract read without enabled condition (always try)
  const {
    data: kaizenBalanceAlways,
    isLoading: isLoadingBalanceAlways,
    error: balanceAlwaysError,
  } = useReadContract({
    address: TOKENS.KAIZEN.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : ["0x0000000000000000000000000000000000000000"],
  });

  useEffect(() => {
    console.log("🧪 Contract Read Test Results:", {
      address,
      kaizenSymbol: {
        data: kaizenSymbol,
        isLoading: isLoadingSymbol,
        error: symbolError?.message,
      },
      kaizenBalance: {
        data: kaizenBalance?.toString(),
        isLoading: isLoadingBalance,
        error: balanceError?.message,
      },
      kaizenBalanceAlways: {
        data: kaizenBalanceAlways?.toString(),
        isLoading: isLoadingBalanceAlways,
        error: balanceAlwaysError?.message,
      },
    });
  }, [
    address,
    kaizenSymbol,
    isLoadingSymbol,
    symbolError,
    kaizenBalance,
    isLoadingBalance,
    balanceError,
    kaizenBalanceAlways,
    isLoadingBalanceAlways,
    balanceAlwaysError,
  ]);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-bold text-blue-800 mb-2">🧪 Contract Read Test</h3>
      <div className="text-sm text-blue-700 space-y-1">
        <div>
          KAIZEN Symbol:{" "}
          {isLoadingSymbol ? "Loading..." : (kaizenSymbol as string) || "Error"}
        </div>
        <div>
          KAIZEN Balance (enabled):{" "}
          {isLoadingBalance
            ? "Loading..."
            : kaizenBalance?.toString() || "Error"}
        </div>
        <div>
          KAIZEN Balance (always):{" "}
          {isLoadingBalanceAlways
            ? "Loading..."
            : kaizenBalanceAlways?.toString() || "Error"}
        </div>
        {symbolError && (
          <div className="text-red-600">
            Symbol Error: {symbolError.message}
          </div>
        )}
        {balanceError && (
          <div className="text-red-600">
            Balance Error: {balanceError.message}
          </div>
        )}
        {balanceAlwaysError && (
          <div className="text-red-600">
            Balance Always Error: {balanceAlwaysError.message}
          </div>
        )}
      </div>
    </div>
  );
}
