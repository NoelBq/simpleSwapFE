"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/types/contracts";

export function RPCDebugTest() {
  const publicClient = usePublicClient();
  const [contractCode, setContractCode] = useState<string | null>(null);
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;

    const testRPC = async () => {
      try {
        console.log("🔍 Testing RPC connection...");

        // Test 1: Get current block number
        const block = await publicClient.getBlockNumber();
        setBlockNumber(block);
        console.log("✅ Block number:", block.toString());

        // Test 2: Get contract code
        const code = await publicClient.getCode({
          address: CONTRACTS.KAIZEN_COIN,
        });
        setContractCode(code || "0x");
        console.log("✅ KAIZEN contract code length:", code?.length || 0);

        // Test 3: Try a simple call
        const kaizenDecimals = await publicClient.readContract({
          address: CONTRACTS.KAIZEN_COIN,
          abi: [
            {
              type: "function",
              name: "decimals",
              stateMutability: "view",
              inputs: [],
              outputs: [{ name: "", type: "uint8" }],
            },
          ],
          functionName: "decimals",
        });
        console.log("✅ KAIZEN decimals:", kaizenDecimals);
      } catch (error) {
        console.error("❌ RPC test failed:", error);
        setRpcError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    testRPC();
  }, [publicClient]);

  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <h3 className="text-lg font-bold mb-4">RPC Debug Test</h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Public Client:</strong> {publicClient ? "✅" : "❌"}
        </div>

        <div>
          <strong>Current Block:</strong>{" "}
          {blockNumber?.toString() || "Loading..."}
        </div>

        <div>
          <strong>KAIZEN Contract Code:</strong>
          <div className="pl-4 font-mono text-xs">
            {contractCode === null
              ? "Loading..."
              : contractCode === "0x"
              ? "❌ No code found"
              : `✅ ${contractCode.length} bytes`}
          </div>
        </div>

        {rpcError && (
          <div>
            <strong>RPC Error:</strong>
            <div className="pl-4 text-red-600">{rpcError}</div>
          </div>
        )}
      </div>
    </div>
  );
}
