"use client";

import { useEffect } from "react";
import { useAccount, useConfig, useClient, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";

export function WagmiDebug() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const config = useConfig();
  const client = useClient();
  const chainId = useChainId();

  useEffect(() => {
    console.log("🔧 Wagmi Debug Info:", {
      address,
      isConnected,
      isConnecting,
      isDisconnected,
      chainId,
      configExists: !!config,
      clientExists: !!client,
      configChains: config?.chains?.map((c) => ({ id: c.id, name: c.name })),
      clientChain: client?.chain,
    });
  }, [
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chainId,
    config,
    client,
  ]);

  // Test a simple query to see if TanStack Query is working
  const testQuery = useQuery({
    queryKey: ["test-query"],
    queryFn: async () => {
      console.log("🧪 Test query executed");
      return "Test query successful";
    },
    enabled: true,
  });

  useEffect(() => {
    console.log("🧪 Test Query State:", {
      data: testQuery.data,
      isLoading: testQuery.isLoading,
      isError: testQuery.isError,
      error: testQuery.error,
      status: testQuery.status,
    });
  }, [
    testQuery.data,
    testQuery.isLoading,
    testQuery.isError,
    testQuery.error,
    testQuery.status,
  ]);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">🔧 Wagmi Debug</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <div>Connected: {isConnected ? "✅" : "❌"}</div>
        <div>Address: {address || "None"}</div>
        <div>Chain ID: {chainId}</div>
        <div>Config: {config ? "✅" : "❌"}</div>
        <div>Client: {client ? "✅" : "❌"}</div>
        <div>Test Query: {testQuery.data || "Loading..."}</div>
      </div>
    </div>
  );
}
