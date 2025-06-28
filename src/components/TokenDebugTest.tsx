"use client";

import { useAccount, useReadContract, useConfig, useChainId } from "wagmi";
import { ERC20_ABI, CONTRACTS } from "@/types/contracts";
import { useEffect } from "react";

export function TokenDebugTest() {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const chainId = useChainId();

  // Test KAIZEN balance with modern ABI
  const modernABI = [
    {
      type: "function",
      name: "balanceOf",
      stateMutability: "view",
      inputs: [{ name: "account", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "allowance",
      stateMutability: "view",
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
      ],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "decimals",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint8" }],
    },
    {
      type: "function",
      name: "symbol",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "string" }],
    },
  ] as const;

  // Test with legacy ABI
  const legacyResult = useReadContract({
    address: CONTRACTS.KAIZEN_COIN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  // Test with modern ABI
  const modernResult = useReadContract({
    address: CONTRACTS.KAIZEN_COIN,
    abi: modernABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Test decimals
  const decimalsResult = useReadContract({
    address: CONTRACTS.KAIZEN_COIN,
    abi: modernABI,
    functionName: "decimals",
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Test symbol
  const symbolResult = useReadContract({
    address: CONTRACTS.KAIZEN_COIN,
    abi: modernABI,
    functionName: "symbol",
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Test a simple contract call directly
  const testContract = useReadContract({
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI mainnet (should fail on Sepolia)
    abi: modernABI,
    functionName: "symbol",
    query: {
      enabled: false, // Disabled for now
    },
  });

  // Debug logging
  useEffect(() => {
    console.log("🔍 TokenDebugTest - Full Debug:", {
      isConnected,
      address,
      chainId,
      configExists: !!config,
      kaizenContract: CONTRACTS.KAIZEN_COIN,
      legacyQuery: {
        data: legacyResult.data,
        isLoading: legacyResult.isLoading,
        error: legacyResult.error?.message,
        status: legacyResult.status,
      },
      modernQuery: {
        data: modernResult.data,
        isLoading: modernResult.isLoading,
        error: modernResult.error?.message,
        status: modernResult.status,
      },
    });
  }, [
    isConnected,
    address,
    chainId,
    config,
    legacyResult.data,
    legacyResult.isLoading,
    legacyResult.error,
    legacyResult.status,
    modernResult.data,
    modernResult.isLoading,
    modernResult.error,
    modernResult.status,
  ]);

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h3 className="text-lg font-bold mb-4">Token Debug Test</h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Connected:</strong> {isConnected ? "✅" : "❌"}
        </div>

        <div>
          <strong>Chain ID:</strong> {chainId}
        </div>

        <div>
          <strong>Config exists:</strong> {config ? "✅" : "❌"}
        </div>

        <div>
          <strong>Connected Address:</strong> {address || "Not connected"}
        </div>

        <div>
          <strong>KAIZEN Contract:</strong> {CONTRACTS.KAIZEN_COIN}
        </div>

        <div>
          <strong>Legacy ABI Result:</strong>
          <div className="pl-4">
            <div>Data: {legacyResult.data?.toString() || "undefined"}</div>
            <div>Loading: {legacyResult.isLoading ? "true" : "false"}</div>
            <div>Status: {legacyResult.status}</div>
            <div>Error: {legacyResult.error?.message || "none"}</div>
          </div>
        </div>

        <div>
          <strong>Modern ABI Result:</strong>
          <div className="pl-4">
            <div>Data: {modernResult.data?.toString() || "undefined"}</div>
            <div>Loading: {modernResult.isLoading ? "true" : "false"}</div>
            <div>Status: {modernResult.status}</div>
            <div>Error: {modernResult.error?.message || "none"}</div>
          </div>
        </div>

        <div>
          <strong>Decimals:</strong>
          <div className="pl-4">
            <div>Data: {decimalsResult.data?.toString() || "undefined"}</div>
            <div>Loading: {decimalsResult.isLoading ? "true" : "false"}</div>
            <div>Status: {decimalsResult.status}</div>
            <div>Error: {decimalsResult.error?.message || "none"}</div>
          </div>
        </div>

        <div>
          <strong>Symbol:</strong>
          <div className="pl-4">
            <div>Data: {symbolResult.data || "undefined"}</div>
            <div>Loading: {symbolResult.isLoading ? "true" : "false"}</div>
            <div>Status: {symbolResult.status}</div>
            <div>Error: {symbolResult.error?.message || "none"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
