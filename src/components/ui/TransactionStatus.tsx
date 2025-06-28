import { ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect } from "react";

interface TransactionStatusProps {
  hash?: string;
  error?: Error | null;
  isPending?: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  successMessage?: string;
  pendingMessage?: string;
  confirmingMessage?: string;
}

export function TransactionStatus({
  hash,
  error,
  isPending = false,
  isConfirming = false,
  isConfirmed = false,
  successMessage = "Transaction successful!",
  pendingMessage = "Transaction pending...",
  confirmingMessage = "Confirming transaction...",
}: TransactionStatusProps) {
  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Log all transaction states for debugging
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", {
        error: error.message,
        hash,
        fullError: error,
      });
    }
    if (hash) {
      console.log("Transaction hash received:", hash);
    }
    if (isConfirmed) {
      console.log("Transaction confirmed:", hash);
    }
  }, [error, hash, isConfirmed]);

  if (error) {
    // Extract more detailed error information
    const getErrorMessage = (error: Error) => {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("user rejected") ||
        errorMessage.includes("user denied")
      ) {
        return "Transaction was rejected by user";
      }
      if (errorMessage.includes("insufficient funds")) {
        return "Insufficient funds for gas or token amount";
      }
      if (errorMessage.includes("execution reverted")) {
        // Try to extract revert reason
        const revertMatch = error.message.match(
          /execution reverted:?\s*(.+?)(?:\n|$)/i
        );
        const revertReason = revertMatch?.[1]?.trim();
        return revertReason
          ? `Transaction failed: ${revertReason}`
          : "Transaction failed - contract execution reverted";
      }
      if (errorMessage.includes("nonce")) {
        return "Transaction nonce error - please try again";
      }
      if (errorMessage.includes("gas")) {
        return "Gas estimation failed - transaction may fail";
      }
      if (errorMessage.includes("slippage")) {
        return "Transaction failed due to slippage - try increasing slippage tolerance";
      }
      if (errorMessage.includes("liquidity")) {
        return "Insufficient liquidity for this transaction";
      }
      if (errorMessage.includes("allowance")) {
        return "Token allowance error - please approve tokens first";
      }
      if (errorMessage.includes("balance")) {
        return "Insufficient token balance";
      }
      if (
        errorMessage.includes("deadline") ||
        errorMessage.includes("expired")
      ) {
        return "Transaction deadline expired - try again";
      }
      if (errorMessage.includes("insufficient_liquidity_minted")) {
        return "Insufficient liquidity minted - amounts may be too small";
      }
      if (errorMessage.includes("insufficient_a_amount")) {
        return "Insufficient token A amount - increase slippage tolerance";
      }
      if (errorMessage.includes("insufficient_b_amount")) {
        return "Insufficient token B amount - increase slippage tolerance";
      }
      if (errorMessage.includes("identical_addresses")) {
        return "Cannot use identical token addresses";
      }
      if (errorMessage.includes("zero_address")) {
        return "Invalid token address detected";
      }

      // Return the original error message if we can't categorize it
      return error.message || "An unknown error occurred";
    };

    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-start gap-2">
          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              Transaction Failed
            </p>
            <p className="text-xs text-red-600 mt-1">
              {getErrorMessage(error)}
            </p>
            {hash && (
              <a
                href={getExplorerUrl(hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 mt-2"
              >
                View on Etherscan
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isConfirmed && hash) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
            <p className="text-xs text-green-600 mt-1 font-mono">
              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
            <a
              href={getExplorerUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 mt-2"
            >
              View on Etherscan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isConfirming && hash) {
    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">
              {confirmingMessage}
            </p>
            <p className="text-xs text-blue-600 mt-1 font-mono">
              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
            <a
              href={getExplorerUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
            >
              View on Etherscan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              {pendingMessage}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Please confirm the transaction in your wallet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
