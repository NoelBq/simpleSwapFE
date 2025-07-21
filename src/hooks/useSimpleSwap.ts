import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type Address, keccak256, encodePacked } from "viem";
import { SIMPLE_SWAP_ABI, CONTRACTS } from "@/types/contracts";
import type {
  AddLiquidityParams,
  RemoveLiquidityParams,
  SwapParams,
} from "@/types/contracts";

export function useSimpleSwapPoolInfo() {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getPoolInfo",
    query: {
      retry: true,
      retryOnMount: true,
      staleTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  });
}

function createPoolKey(tokenA: Address, tokenB: Address): `0x${string}` {
  const [token0, token1] =
    tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];

  return keccak256(encodePacked(["address", "address"], [token0, token1]));
}

export function usePoolInfo(tokenA: Address, tokenB: Address) {
  const poolKey = createPoolKey(tokenA, tokenB);

  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getPoolInfo",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    args: [poolKey],
    query: {
      enabled: Boolean(tokenA && tokenB),
      retry: false,
      staleTime: 30000,
    },
  });
}

export function useAmountOut(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
) {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getAmountOut",
    args: [amountIn, reserveIn, reserveOut],
    query: {
      enabled: Boolean(amountIn > 0n && reserveIn > 0n && reserveOut > 0n),
      retry: true,
      staleTime: 10000,
      refetchOnMount: false,
    },
  });
}

/**
 * Hook to get token price
 */
export function useTokenPrice(tokenA: Address, tokenB: Address) {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getPrice",
    args: [tokenA, tokenB],
    query: {
      enabled: Boolean(tokenA && tokenB),
    },
  });
}

export function useLiquidityBalance(
  user: Address | undefined,
  tokenA: Address,
  tokenB: Address
) {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    functionName: "getLiquidityBalance",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    args: user ? [user, tokenA, tokenB] : undefined,
    query: {
      enabled: Boolean(user && tokenA && tokenB),
    },
  });
}

export function useSwapFee() {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    functionName: "SWAP_FEE",
  });
}

/**
 * Hook to get fee denominator
 */
export function useFeeDenominator() {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    functionName: "FEE_DENOMINATOR",
  });
}

/**
 * Hook for adding liquidity
 */
export function useAddLiquidity() {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const addLiquidity = (params: AddLiquidityParams) => {
    console.log("Adding liquidity with params:", params);
    console.log("Transaction details:", {
      tokenA: params.tokenA,
      tokenB: params.tokenB,
      amountADesired: params.amountADesired.toString(),
      amountBDesired: params.amountBDesired.toString(),
      amountAMin: params.amountAMin.toString(),
      amountBMin: params.amountBMin.toString(),
      to: params.to,
      deadline: params.deadline.toString(),
      deadlineDate: new Date(Number(params.deadline) * 1000).toISOString(),
    });

    writeContract({
      address: CONTRACTS.SIMPLE_SWAP,
      abi: SIMPLE_SWAP_ABI,
      functionName: "addLiquidity",
      args: [
        params.tokenA,
        params.tokenB,
        params.amountADesired,
        params.amountBDesired,
        params.amountAMin,
        params.amountBMin,
        params.to,
        params.deadline,
      ],
    });
  };

  // Enhanced error detection and logging
  const combinedError = writeError || receiptError;

  // Check if transaction failed even when wagmi doesn't detect it
  if (receipt && receipt.status === "reverted" && !receiptError) {
    console.error(
      "🔴 TRANSACTION REVERTED - Creating synthetic error for UI display"
    );
    // We'll handle this in the component by checking receipt status
  }

  // Enhanced logging for debugging
  if (writeError) {
    console.error("Add liquidity write error:", {
      message: writeError.message,
      cause: writeError.cause,
      fullError: writeError,
    });
  }
  if (receiptError) {
    console.error("Add liquidity receipt error:", {
      message: receiptError.message,
      cause: receiptError.cause,
      hash,
      fullError: receiptError,
    });
  }
  if (isReceiptError) {
    console.error("Transaction failed on-chain:", {
      hash,
      receiptError,
      receipt,
    });
  }
  if (receipt) {
    console.log("Transaction receipt received:", {
      hash: receipt.transactionHash,
      status: receipt.status,
      gasUsed: receipt.gasUsed?.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
      isReverted: receipt.status === "reverted",
    });

    if (receipt.status === "reverted") {
      console.error("🔴 TRANSACTION REVERTED:", {
        hash,
        receipt,
        possibleReasons: [
          "EXPIRED deadline - check if deadline is in the future",
          "INSUFFICIENT_A_AMOUNT or INSUFFICIENT_B_AMOUNT - slippage too high",
          "Token transfer failed - insufficient balance or allowance",
          "INSUFFICIENT_LIQUIDITY_MINTED - amounts too small",
          "Invalid token addresses or identical tokens",
        ],
      });
    }
  }

  return {
    addLiquidity,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
    isReverted: receipt?.status === "reverted",
    receipt,
  };
}

/**
 * Hook for removing liquidity
 */
export function useRemoveLiquidity() {
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

  const removeLiquidity = (params: RemoveLiquidityParams) => {
    console.log("Removing liquidity with params:", params);
    writeContract({
      address: CONTRACTS.SIMPLE_SWAP,
      abi: SIMPLE_SWAP_ABI,
      functionName: "removeLiquidity",
      args: [
        params.tokenA,
        params.tokenB,
        params.liquidity,
        params.amountAMin,
        params.amountBMin,
        params.to,
        params.deadline,
      ],
    });
  };

  // Combine write and receipt errors
  const combinedError = writeError || receiptError;

  // Log errors for debugging
  if (writeError) {
    console.error("Remove liquidity write error:", writeError);
  }
  if (receiptError) {
    console.error("Remove liquidity receipt error:", receiptError);
  }

  return {
    removeLiquidity,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
  };
}

/**
 * Hook for swapping tokens
 */
export function useSwapTokens() {
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

  const swapTokens = (params: SwapParams) => {
    console.log("Swapping tokens with params:", params);
    writeContract({
      address: CONTRACTS.SIMPLE_SWAP,
      abi: SIMPLE_SWAP_ABI,
      functionName: "swapExactTokensForTokens",
      args: [
        params.amountIn,
        params.amountOutMin,
        params.path,
        params.to,
        params.deadline,
      ],
    });
  };

  // Combine write and receipt errors
  const combinedError = writeError || receiptError;

  // Log errors for debugging
  if (writeError) {
    console.error("Swap tokens write error:", writeError);
  }
  if (receiptError) {
    console.error("Swap tokens receipt error:", receiptError);
  }

  return {
    swapTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
  };
}

/**
 * Hook to get pool reserves using getReserves (simpler approach)
 */
export function usePoolReserves() {
  return useReadContract({
    address: CONTRACTS.SIMPLE_SWAP,
    abi: SIMPLE_SWAP_ABI,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    functionName: "getReserves",
    query: {
      retry: false,
      staleTime: 30000,
    },
  });
}
