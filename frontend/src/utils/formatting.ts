/**
 * Common formatting utilities
 */

/** Zero address constant for null transaction detection */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Format an address for display (truncated with ellipsis)
 * @param address - Full address string
 * @param prefixLength - Characters to show at start (default: 6)
 * @param suffixLength - Characters to show at end (default: 4)
 */
export function formatAddress(
  address: string,
  prefixLength = 6,
  suffixLength = 4
): string {
  if (!address || address.length < prefixLength + suffixLength + 3) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Check if a transaction is null/not found (to address is zero address)
 * @param toAddress - The transaction destination address
 */
export function isNullTransaction(toAddress: string): boolean {
  return toAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase();
}

/**
 * Format a Unix timestamp for display
 * @param timestamp - Unix timestamp in seconds
 */
export function formatTimestamp(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Format a date for display (short format)
 * @param date - Date object or timestamp
 */
export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString();
}
