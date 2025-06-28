#!/usr/bin/env bun

/**
 * Script to check if a user has verified the contract with the verifier contract
 * 
 * Usage:
 * - As a script: bun run src/scripts/checkVerification.ts [author_name]
 * - As a utility: import { checkUserVerification } from './scripts/checkVerification'
 */

import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { VERIFICATION_ABI, CONTRACTS } from "@/types/contracts";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

/**
 * Check if a specific user (author) has verified the contract
 * @param authorName - The name of the author to search for
 * @param maxIndex - Maximum index to search (default: 100)
 * @returns Promise<{isVerified: boolean, index?: number, author?: string}>
 */
export async function checkUserVerification(
  authorName: string,
  maxIndex: number = 100
): Promise<{ isVerified: boolean; index?: number; author?: string }> {
  try {
    console.log(`🔍 Searching for author "${authorName}" in verification records...`);
    
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
          console.log(`📝 Reached end of verification records at index ${i}`);
          break;
        }

        console.log(`📋 Index ${i}: ${author}`);

        // Check if this author matches our search (case-insensitive)
        if (author.toLowerCase().trim() === authorName.toLowerCase().trim()) {
          console.log(`✅ Found verification! Author "${author}" at index ${i}`);
          return {
            isVerified: true,
            index: i,
            author: author,
          };
        }
      } catch {
        // If we get an error reading this index, we've likely reached the end
        console.log(`📝 Reached end of verification records at index ${i}`);
        break;
      }
    }

    console.log(`❌ Author "${authorName}" not found in verification records`);
    return { isVerified: false };
  } catch (error) {
    console.error("❌ Error checking verification:", error);
    throw error;
  }
}

/**
 * Get all verification records
 * @param maxIndex - Maximum index to search (default: 100)
 * @returns Promise<Array<{index: number, author: string}>>
 */
export async function getAllVerificationRecords(
  maxIndex: number = 100
): Promise<Array<{ index: number; author: string }>> {
  try {
    console.log("📋 Fetching all verification records...");
    const records: Array<{ index: number; author: string }> = [];

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
          console.log(`📝 Reached end of verification records at index ${i}`);
          break;
        }

        records.push({ index: i, author });
        console.log(`📋 Index ${i}: ${author}`);
      } catch {
        // If we get an error reading this index, we've likely reached the end
        console.log(`📝 Reached end of verification records at index ${i}`);
        break;
      }
    }

    console.log(`📊 Total verification records found: ${records.length}`);
    return records;
  } catch (error) {
    console.error("❌ Error fetching verification records:", error);
    throw error;
  }
}

/**
 * Check verification status for multiple users
 * @param authorNames - Array of author names to check
 * @param maxIndex - Maximum index to search (default: 100)
 * @returns Promise<Record<string, {isVerified: boolean, index?: number}>>
 */
export async function checkMultipleUsersVerification(
  authorNames: string[],
  maxIndex: number = 100
): Promise<Record<string, { isVerified: boolean; index?: number }>> {
  const results: Record<string, { isVerified: boolean; index?: number }> = {};
  
  // Initialize results
  authorNames.forEach(name => {
    results[name] = { isVerified: false };
  });

  try {
    console.log(`🔍 Checking verification for ${authorNames.length} users...`);
    
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
          results[matchingName] = { isVerified: true, index: i };
          console.log(`✅ Found verification for "${matchingName}" at index ${i}`);
        }
      } catch {
        break;
      }
    }

    return results;
  } catch (error) {
    console.error("❌ Error checking multiple verifications:", error);
    throw error;
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("📋 Getting all verification records...");
    const records = await getAllVerificationRecords();
    
    if (records.length === 0) {
      console.log("📝 No verification records found");
    } else {
      console.log("\n📊 Verification Records Summary:");
      console.log("================================");
      records.forEach(({ index, author }) => {
        console.log(`${index.toString().padStart(3)}: ${author}`);
      });
    }
  } else {
    const authorName = args[0];
    console.log(`🔍 Checking verification for: "${authorName}"`);
    
    const result = await checkUserVerification(authorName);
    
    if (result.isVerified) {
      console.log(`\n✅ VERIFIED`);
      console.log(`📍 Index: ${result.index}`);
      console.log(`👤 Author: ${result.author}`);
    } else {
      console.log(`\n❌ NOT VERIFIED`);
      console.log(`👤 Author "${authorName}" has not verified the contract`);
    }
  }
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}
