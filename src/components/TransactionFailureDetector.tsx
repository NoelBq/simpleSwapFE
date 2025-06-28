import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";

interface TransactionFailureDetectorProps {
  hash?: string;
  onFailureDetected?: (reason: string) => void;
}

export function TransactionFailureDetector({
  hash,
  onFailureDetected,
}: TransactionFailureDetectorProps) {
  const publicClient = usePublicClient();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!hash || !publicClient || isChecking) return;

    const checkTransactionFailure = async () => {
      setIsChecking(true);
      try {
        console.log("🔍 Checking transaction receipt for:", hash);

        // Wait a bit for transaction to be mined
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const receipt = await publicClient.getTransactionReceipt({
          hash: hash as `0x${string}`,
        });

        console.log("📄 Transaction receipt:", {
          hash: receipt.transactionHash,
          status: receipt.status,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        });

        if (receipt.status === "reverted") {
          console.error("🔴 TRANSACTION REVERTED DETECTED");

          // Try to get the transaction details for more info
          try {
            const tx = await publicClient.getTransaction({
              hash: hash as `0x${string}`,
            });
            console.log("📋 Transaction details:", {
              from: tx.from,
              to: tx.to,
              value: tx.value.toString(),
              gas: tx.gas.toString(),
              gasPrice: tx.gasPrice?.toString(),
              data: tx.input.slice(0, 100) + "...", // First 100 chars of calldata
            });

            // Try to simulate the transaction to get revert reason
            if (tx.to) {
              try {
                await publicClient.call({
                  to: tx.to,
                  data: tx.input,
                  value: tx.value,
                  gas: tx.gas,
                });
              } catch (simulationError: unknown) {
                const error = simulationError as Error & {
                  details?: string;
                  cause?: unknown;
                };
                console.error(
                  "🎯 Simulation error (this gives us the revert reason):",
                  {
                    message: error.message,
                    details: error.details,
                    cause: error.cause,
                  }
                );

                // Extract revert reason from simulation error
                const revertReason = extractRevertReason(error);
                if (revertReason && onFailureDetected) {
                  onFailureDetected(revertReason);
                }
              }
            }
          } catch (txError) {
            console.error("Error getting transaction details:", txError);
          }

          if (onFailureDetected && !extractRevertReason) {
            onFailureDetected("Transaction reverted without specific reason");
          }
        }
      } catch (error) {
        console.error("Error checking transaction:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Start checking after a short delay
    const timeoutId = setTimeout(checkTransactionFailure, 1000);
    return () => clearTimeout(timeoutId);
  }, [hash, publicClient, isChecking, onFailureDetected]);

  return null; // This component doesn't render anything
}

function extractRevertReason(
  error: Error & { details?: string }
): string | null {
  const errorMessage = error.message || error.details || "";

  // Common revert reason patterns
  const patterns = [
    /execution reverted:?\s*(.+?)(?:\n|$)/i,
    /revert (.+?)(?:\n|$)/i,
    /"message":\s*"(.+?)"/i,
    /reverted with reason string '(.+?)'/i,
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Check for specific contract errors
  if (errorMessage.includes("EXPIRED")) return "Transaction deadline expired";
  if (errorMessage.includes("INSUFFICIENT_A_AMOUNT"))
    return "Insufficient token A amount - increase slippage tolerance";
  if (errorMessage.includes("INSUFFICIENT_B_AMOUNT"))
    return "Insufficient token B amount - increase slippage tolerance";
  if (errorMessage.includes("INSUFFICIENT_LIQUIDITY_MINTED"))
    return "Insufficient liquidity minted - amounts too small";
  if (errorMessage.includes("ZERO_ADDRESS")) return "Invalid address provided";
  if (errorMessage.includes("IDENTICAL_ADDRESSES"))
    return "Token addresses are identical";
  if (errorMessage.includes("insufficient funds"))
    return "Insufficient funds for gas";
  if (errorMessage.includes("transfer amount exceeds balance"))
    return "Insufficient token balance";
  if (errorMessage.includes("transfer amount exceeds allowance"))
    return "Insufficient token allowance";

  return null;
}
