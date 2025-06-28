import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type Address } from "viem";
import { ERC20_ABI } from "@/types/contracts";

/**
 * Hook to get token balance
 */
export function useTokenBalance(
  tokenAddress: Address,
  userAddress: Address | undefined
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(userAddress),
    },
  });
}

/**
 * Hook to get token allowance
 */
export function useTokenAllowance(
  tokenAddress: Address,
  owner: Address | undefined,
  spender: Address
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: Boolean(owner),
    },
  });
}

/**
 * Hook to get token decimals
 */
export function useTokenDecimals(tokenAddress: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });
}

/**
 * Hook to get token symbol
 */
export function useTokenSymbol(tokenAddress: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
  });
}

/**
 * Hook to get token name
 */
export function useTokenName(tokenAddress: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "name",
  });
}

/**
 * Hook for token approval
 */
export function useTokenApproval() {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (tokenAddress: Address, spender: Address, amount: bigint) => {
    console.log("Approving token:", {
      tokenAddress,
      spender,
      amount: amount.toString(),
    });
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  // Combine write and receipt errors
  const combinedError = writeError || receiptError;

  // Log errors for debugging
  if (writeError) {
    console.error("Token approval write error:", writeError);
  }
  if (receiptError) {
    console.error("Token approval receipt error:", receiptError);
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
  };
}

/**
 * Hook for token transfer
 */
export function useTokenTransfer() {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = (tokenAddress: Address, to: Address, amount: bigint) => {
    console.log("Transferring token:", {
      tokenAddress,
      to,
      amount: amount.toString(),
    });
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to, amount],
    });
  };

  // Combine write and receipt errors
  const combinedError = writeError || receiptError;

  // Log errors for debugging
  if (writeError) {
    console.error("Token transfer write error:", writeError);
  }
  if (receiptError) {
    console.error("Token transfer receipt error:", receiptError);
  }

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
  };
}
