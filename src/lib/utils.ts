import { formatUnits, parseUnits, type Address } from "viem";
import { TOKENS, type Token } from "@/types/contracts";

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  displayDecimals: number = 4
): string {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);

  if (num === 0) return "0";
  if (num < 0.0001) return "< 0.0001";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Parse token amount from string input
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  if (!amount || amount === "") return 0n;
  return parseUnits(amount, decimals);
}

/**
 * Get token by address
 */
export function getTokenByAddress(address: Address): Token | undefined {
  return Object.values(TOKENS).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Calculate deadline (current time + minutes)
 */
export function getDeadline(minutes: number = 20): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + minutes * 60);
}

/**
 * Calculate slippage amount
 */
export function calculateSlippage(
  amount: bigint,
  slippagePercent: number
): bigint {
  const slippage = BigInt(Math.floor(slippagePercent * 100)); // Convert to basis points
  return (amount * (10000n - slippage)) / 10000n;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate price impact
 */
export function calculatePriceImpact(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  amountOut: bigint
): number {
  if (reserveIn === 0n || reserveOut === 0n) return 0;

  const priceBeforeWei = (reserveOut * parseUnits("1", 18)) / reserveIn;
  const priceAfterWei =
    ((reserveOut - amountOut) * parseUnits("1", 18)) / (reserveIn + amountIn);

  const priceBefore = parseFloat(formatUnits(priceBeforeWei, 18));
  const priceAfter = parseFloat(formatUnits(priceAfterWei, 18));

  return Math.abs((priceAfter - priceBefore) / priceBefore) * 100;
}

/**
 * Validate address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: Address, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
