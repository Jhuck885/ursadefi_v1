/** Shared demo-mode identity and local wipe.
 *  Demo must never surface a real user's name, email, or invoices.
 */

export const DEMO_WALLET_ADDRESS = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
export const DEMO_WALLET_PUBLIC_KEY =
  'ED00000000000000000000000000000000000000000000000000000000000000';

export function isDemoWallet(address?: string | null): boolean {
  if (!address) return false;
  return address.trim() === DEMO_WALLET_ADDRESS;
}

/** Keys that can hold personal or invoice state in the browser. */
const LOCAL_KEYS = [
  'ursadefi_company_profile',
  'invoices',
  'clients',
  'ursadefi_invoice_reminders',
  'xrpl_wallet',
] as const;

/**
 * Hard reset browser state before entering demo.
 * Leaves the app looking brand-new — no names, emails, or prior invoices.
 */
export function resetDemoLocalState(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LOCAL_KEYS) {
      localStorage.removeItem(key);
    }
    // Also clear any legacy keys that might have been used
    localStorage.removeItem('company_profile');
    localStorage.removeItem('profile');
    localStorage.removeItem('ursadefi_profile');
  } catch {
    // ignore quota / private mode
  }
}
