import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type Address } from "viem";
import { VERIFICATION_ABI, CONTRACTS } from "@/types/contracts";

/**
 * Hook to read authors by index
 */
export function useVerificationAuthors(index: number) {
  return useReadContract({
    address: CONTRACTS.VERIFICATION,
    abi: VERIFICATION_ABI,
    functionName: "authors",
    args: [BigInt(index)],
  });
}

/**
 * Hook for verification transaction
 */
export function useVerification() {
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

  const verify = (
    swapContract: Address,
    tokenA: Address,
    tokenB: Address,
    amountA: bigint,
    amountB: bigint,
    amountIn: bigint,
    author: string
  ) => {
    console.log("Verifying SimpleSwap contract:", {
      swapContract,
      tokenA,
      tokenB,
      amountA: amountA.toString(),
      amountB: amountB.toString(),
      amountIn: amountIn.toString(),
      author,
    });

    writeContract({
      address: CONTRACTS.VERIFICATION,
      abi: VERIFICATION_ABI,
      functionName: "verify",
      args: [swapContract, tokenA, tokenB, amountA, amountB, amountIn, author],
    });
  };

  const combinedError = writeError || receiptError;

  if (writeError) {
    console.error("Verification write error:", writeError);
  }
  if (receiptError) {
    console.error("Verification receipt error:", receiptError);
  }

  return {
    verify,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
  };
}
