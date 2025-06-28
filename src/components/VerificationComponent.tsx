"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CheckCircle, AlertCircle, Users, Send } from "lucide-react";

import { TOKENS, CONTRACTS, ERC20_ABI } from "@/types/contracts";
import {
  useVerification,
  useVerificationAuthors,
} from "@/hooks/useVerification";
import { parseTokenAmount } from "@/lib/utils";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TokenSelector } from "@/components/TokenSelector";
import { TransactionStatus } from "@/components/ui/TransactionStatus";

export function VerificationComponent() {
  const { address } = useAccount();
  const [tokenA, setTokenA] = useState(TOKENS.KAIZEN);
  const [tokenB, setTokenB] = useState(TOKENS.YUREI);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedAuthorIndex, setSelectedAuthorIndex] = useState(0);

  // Transfer states
  const [transferAmountA, setTransferAmountA] = useState("");
  const [transferAmountB, setTransferAmountB] = useState("");

  // Verification hook
  const { verify, hash, isPending, isConfirming, isConfirmed, error } =
    useVerification();

  // Transfer hooks
  const {
    writeContract: writeTransfer,
    data: transferHash,
    isPending: isTransferPending,
  } = useWriteContract();
  const { isLoading: isTransferConfirming } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  // Read authors hook
  const { data: authorData } = useVerificationAuthors(selectedAuthorIndex);

  // Transfer function
  const transferTokens = async (tokenAddress: string, amount: string) => {
    if (!amount || !address) return;

    try {
      const parsedAmount = parseTokenAmount(amount, 18);
      writeTransfer({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [CONTRACTS.VERIFICATION, parsedAmount],
      });
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const handleVerify = () => {
    if (!address || !amountA || !amountB || !amountIn || !author.trim()) return;

    // Check if verification contract address is set
    if (
      CONTRACTS.VERIFICATION === "0x0000000000000000000000000000000000000000"
    ) {
      alert(
        "Verification contract address not set. Please update CONTRACTS.VERIFICATION in contracts.ts"
      );
      return;
    }

    const amountAWei = parseTokenAmount(amountA, tokenA.decimals);
    const amountBWei = parseTokenAmount(amountB, tokenB.decimals);
    const amountInWei = parseTokenAmount(amountIn, 18); // Assuming amountIn is in ETH units

    verify(
      CONTRACTS.SIMPLE_SWAP,
      tokenA.address,
      tokenB.address,
      amountAWei,
      amountBWei,
      amountInWei,
      author.trim()
    );
  };

  const isFormValid =
    amountA && amountB && amountIn && author.trim() && address;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Contract Verification
          </h2>
          <p className="text-sm text-gray-600">
            Verify SimpleSwap contract functionality
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contract Information */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Contract Addresses
          </h3>
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-medium">SimpleSwap:</span>{" "}
              <code className="bg-white px-1 rounded">
                {CONTRACTS.SIMPLE_SWAP}
              </code>
            </div>
            <div>
              <span className="font-medium">Verification:</span>{" "}
              <code className="bg-white px-1 rounded">
                {CONTRACTS.VERIFICATION}
              </code>
              {CONTRACTS.VERIFICATION ===
                "0x0000000000000000000000000000000000000000" && (
                <span className="ml-2 text-red-600 font-medium">
                  ⚠️ Not configured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Token Transfer Section */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Transfer Tokens to Verifier Contract
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            The verifier contract needs tokens before verification. Transfer
            tokens first:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Transfer KaizenCoin
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount (e.g. 100)"
                  value={transferAmountA}
                  onChange={(e) => setTransferAmountA(e.target.value)}
                  className="flex-1"
                  step="any"
                  min="0"
                />
                <Button
                  onClick={() =>
                    transferTokens(TOKENS.KAIZEN.address, transferAmountA)
                  }
                  disabled={!transferAmountA || isTransferPending}
                  variant="outline"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Transfer YureiCoin
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount (e.g. 100)"
                  value={transferAmountB}
                  onChange={(e) => setTransferAmountB(e.target.value)}
                  className="flex-1"
                  step="any"
                  min="0"
                />
                <Button
                  onClick={() =>
                    transferTokens(TOKENS.YUREI.address, transferAmountB)
                  }
                  disabled={!transferAmountB || isTransferPending}
                  variant="outline"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>

          {transferHash && (
            <div className="mt-3">
              <TransactionStatus
                hash={transferHash}
                isPending={isTransferPending}
                isConfirming={isTransferConfirming}
                successMessage="Transfer successful!"
              />
            </div>
          )}
        </div>

        {/* Author Lookup */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Users className="inline h-4 w-4 mr-1" />
            Author Lookup
          </label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Author index"
              value={selectedAuthorIndex}
              onChange={(e) => setSelectedAuthorIndex(Number(e.target.value))}
              className="flex-1"
              min="0"
            />
            <div className="flex-2 p-2 bg-gray-50 rounded-md text-sm">
              {authorData || "No author found"}
            </div>
          </div>
        </div>

        {/* Token Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Token A
            </label>
            <TokenSelector selectedToken={tokenA} onTokenSelect={setTokenA} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Token B
            </label>
            <TokenSelector selectedToken={tokenB} onTokenSelect={setTokenB} />
          </div>
        </div>

        {/* Amount Inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount A ({tokenA.symbol})
            </label>
            <Input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              step="any"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount B ({tokenB.symbol})
            </label>
            <Input
              type="number"
              placeholder="0.0"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              step="any"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount In
            </label>
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              step="any"
              min="0"
            />
          </div>
        </div>

        {/* Author Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Author Name
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={!isFormValid || isPending || isConfirming}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            "Preparing Verification..."
          ) : isConfirming ? (
            "Confirming Verification..."
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Verify Contract</span>
            </div>
          )}
        </Button>

        {/* Transaction Status */}
        {(hash || error) && (
          <TransactionStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            error={error}
          />
        )}

        {/* Warning */}
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Verification Purpose</p>
            <p>
              This function is designed to verify that the SimpleSwap contract
              is working correctly with the specified parameters and tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
