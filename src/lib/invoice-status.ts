/**
 * Invoice status model (fee-on-paid)
 *
 * draft          — free, editable
 * sent           — shared / awaiting client payment (optional)
 * paid_fee_due   — client paid (detected or confirmed); platform fee required
 * settled        — platform fee confirmed on ledger; unlocks CSV, mint, complete
 * paid           — legacy alias treated as paid_fee_due until fee confirmed
 * minted / burned — terminal NFT states (require settled first for new mints)
 */

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid_fee_due'
  | 'settled'
  | 'paid'
  | 'activated'
  | 'minted'
  | 'burned'
  | 'overdue'
  | string;

/** Client money received; platform fee not yet confirmed */
export function isPaidFeeDue(status?: string | null): boolean {
  const s = (status || '').toLowerCase();
  return s === 'paid_fee_due' || s === 'paid' || s === 'activated';
}

/** Platform fee confirmed — full product unlock */
export function isSettled(status?: string | null): boolean {
  const s = (status || '').toLowerCase();
  return s === 'settled' || s === 'minted';
}

/** Can export tax CSV / use completion features */
export function canUsePlatformFeatures(status?: string | null): boolean {
  return isSettled(status);
}

/** Can mint NFT */
export function canMintNft(status?: string | null): boolean {
  return isSettled(status) && (status || '').toLowerCase() !== 'burned';
}

export function statusLabel(status?: string | null): string {
  const s = (status || 'draft').toLowerCase();
  switch (s) {
    case 'paid_fee_due':
    case 'paid':
    case 'activated':
      return 'Fee due';
    case 'settled':
      return 'Settled';
    case 'minted':
      return 'Minted';
    case 'burned':
      return 'Burned';
    case 'sent':
      return 'Sent';
    case 'overdue':
      return 'Overdue';
    default:
      return s || 'draft';
  }
}
