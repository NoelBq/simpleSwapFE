import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { VERIFICATION_ABI, CONTRACTS } from "@/types/contracts";

export interface VerificationStatus {
  isVerified: boolean;
  index?: number;
  author?: string;
  isLoading: boolean;
  error?: string;
}

/**
 * Hook to check if a specific user has verified the contract
 */
export function useUserVerificationStatus(
  authorName: string,
  maxIndex: number = 100
) {
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    isLoading: false,
  });
  
  const publicClient = usePublicClient();

  const checkVerification = useCallback(async () => {
    if (!authorName.trim() || !publicClient) return;

    setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      for (let i = 0; i < maxIndex; i++) {
        try {
          const author = await publicClient.readContract({
            address: CONTRACTS.VERIFICATION,
            abi: VERIFICATION_ABI,
            functionName: "authors",
            args: [BigInt(i)],
          });

          // If we get an empty string, we've likely reached the end
          if (!author || author.trim() === "") {
            break;
          }

          // Check if this author matches our search (case-insensitive)
          if (author.toLowerCase().trim() === authorName.toLowerCase().trim()) {
            setStatus({
              isVerified: true,
              index: i,
              author: author,
              isLoading: false,
            });
            return;
          }
        } catch {
          // If we get an error reading this index, we've likely reached the end
          break;
        }
      }

      // If we reach here, author was not found
      setStatus({
        isVerified: false,
        isLoading: false,
      });
    } catch (error) {
      setStatus({
        isVerified: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [authorName, maxIndex, publicClient]);

  useEffect(() => {
    if (authorName.trim()) {
      checkVerification();
    }
  }, [checkVerification, authorName]);

  return {
    ...status,
    refetch: checkVerification,
  };
}

/**
 * Hook to get all verification records
 */
export function useAllVerificationRecords(maxIndex: number = 100) {
  const [records, setRecords] = useState<Array<{ index: number; author: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  
  const publicClient = usePublicClient();

  const fetchRecords = useCallback(async () => {
    if (!publicClient) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const fetchedRecords: Array<{ index: number; author: string }> = [];

      for (let i = 0; i < maxIndex; i++) {
        try {
          const author = await publicClient.readContract({
            address: CONTRACTS.VERIFICATION,
            abi: VERIFICATION_ABI,
            functionName: "authors",
            args: [BigInt(i)],
          });

          // If we get an empty string, we've likely reached the end
          if (!author || author.trim() === "") {
            break;
          }

          fetchedRecords.push({ index: i, author });
        } catch {
          // If we get an error reading this index, we've likely reached the end
          break;
        }
      }

      setRecords(fetchedRecords);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [maxIndex, publicClient]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    refetch: fetchRecords,
  };
}

/**
 * Hook to check verification status for multiple users
 */
export function useMultipleUsersVerificationStatus(
  authorNames: string[],
  maxIndex: number = 100
) {
  const [results, setResults] = useState<Record<string, { isVerified: boolean; index?: number }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  
  const publicClient = usePublicClient();

  const checkMultipleVerifications = useCallback(async () => {
    if (authorNames.length === 0 || !publicClient) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const newResults: Record<string, { isVerified: boolean; index?: number }> = {};
      
      // Initialize results
      authorNames.forEach(name => {
        newResults[name] = { isVerified: false };
      });

      for (let i = 0; i < maxIndex; i++) {
        try {
          const author = await publicClient.readContract({
            address: CONTRACTS.VERIFICATION,
            abi: VERIFICATION_ABI,
            functionName: "authors",
            args: [BigInt(i)],
          });

          // If we get an empty string, we've likely reached the end
          if (!author || author.trim() === "") {
            break;
          }

          // Check if this author matches any of our search names
          const matchingName = authorNames.find(
            name => name.toLowerCase().trim() === author.toLowerCase().trim()
          );

          if (matchingName) {
            newResults[matchingName] = { isVerified: true, index: i };
          }
        } catch {
          break;
        }
      }

      setResults(newResults);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [authorNames, maxIndex, publicClient]);

  useEffect(() => {
    if (authorNames.length > 0) {
      checkMultipleVerifications();
    }
  }, [checkMultipleVerifications, authorNames]);

  return {
    results,
    isLoading,
    error,
    refetch: checkMultipleVerifications,
  };
}
