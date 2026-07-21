/** Platform business rules — single source of truth */

/** Minimum USD amount to create / save / pay an invoice */
export const MIN_INVOICE_USD = 25;

/** Minimum USD amount to mint an invoice as XRPL NFT */
export const MIN_MINT_USD = 50;

/** Platform fee rate (0.15%) */
export const PLATFORM_FEE_RATE = 0.0015;

/** Absolute minimum platform fee per paid invoice (USD) */
export const MIN_PLATFORM_FEE_USD = 0.25;

/** Official XRPL address that receives the platform fee */
export const PLATFORM_FEE_RECEIVER = 'rs6nu5gcDn6HYLzd6HCFNLp6UjXDyYYTQi';

/**
 * Calculate platform fee from service subtotal.
 * Fee = max(subtotal × 0.15%, $0.25)
 */
export function calcPlatformFee(subtotalUsd: number): number {
  const raw = Number(subtotalUsd) || 0;
  if (raw <= 0) return 0;
  const pct = raw * PLATFORM_FEE_RATE;
  return parseFloat(Math.max(pct, MIN_PLATFORM_FEE_USD).toFixed(2));
}

/** Fee rate displayed as percent string for invoices */
export const PLATFORM_FEE_PERCENT_LABEL = '0.15%';
