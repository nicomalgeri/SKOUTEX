/**
 * Format a number with thousand separators
 * @param value - Number or string to format
 * @returns Formatted string with commas
 * @example formatNumber(10000000) => "10,000,000"
 */
export function formatNumber(value: number | string): string {
  if (value === "" || value === null || value === undefined) return "";

  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(num)) return "";

  return num.toLocaleString("en-US");
}

/**
 * Parse a formatted number string back to a number
 * @param value - Formatted string with commas
 * @returns Number value
 * @example parseFormattedNumber("10,000,000") => 10000000
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format currency in EUR
 * @param amount - Amount in EUR
 * @param showCurrency - Whether to show € symbol
 * @returns Formatted string
 * @example formatEUR(10000000) => "€10,000,000"
 */
export function formatEUR(amount: number, showCurrency = true): string {
  const formatted = formatNumber(amount);
  return showCurrency ? `€${formatted}` : formatted;
}

/**
 * Format large numbers with K/M/B suffixes
 * @param value - Number to format
 * @returns Formatted string with suffix
 * @example formatCompact(10000000) => "10M"
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}
