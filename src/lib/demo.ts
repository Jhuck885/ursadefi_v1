/**
 * Demo sandbox — isolated per visitor, never shared.
 *
 * Every "Try Demo" click:
 *  1. Wipes local app data
 *  2. Issues a brand-new demo wallet id (unique to that browser session)
 *  3. Never reads/writes Supabase under that id
 *
 * No two people share an identity. No personal data can leak across demos.
 */

/** Legacy fixed address (old demos). Still treated as demo-only. */
export const LEGACY_DEMO_WALLET_ADDRESS = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';

export const DEMO_WALLET_PUBLIC_KEY =
  'ED00000000000000000000000000000000000000000000000000000000000000';

const DEMO_PREFIX = 'demo_';

export function isDemoWallet(address?: string | null): boolean {
  if (!address) return false;
  const a = address.trim();
  return a === LEGACY_DEMO_WALLET_ADDRESS || a.startsWith(DEMO_PREFIX);
}

/** Cryptographically-ish unique id for this sandbox instance. */
function newSandboxId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Create a one-off demo wallet. Call only after resetDemoLocalState().
 * Address is unique every time — never reuses another visitor's id.
 */
export function createFreshDemoWallet(): { address: string; publicKey: string } {
  const id = newSandboxId();
  return {
    address: `${DEMO_PREFIX}${id}`,
    publicKey: DEMO_WALLET_PUBLIC_KEY,
  };
}

const LOCAL_KEYS = [
  'ursadefi_company_profile',
  'invoices',
  'clients',
  'ursadefi_invoice_reminders',
  'xrpl_wallet',
  'company_profile',
  'profile',
  'ursadefi_profile',
  'ursadefi_demo_session',
] as const;

/**
 * Hard sandbox reset — empties every local key that could hold identity or invoices.
 * Safe to call on every Try Demo click.
 */
export function resetDemoLocalState(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LOCAL_KEYS) {
      localStorage.removeItem(key);
    }
    // Sweep any leftover ursadefi_* keys
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('ursadefi_') || k.startsWith('demo_'))) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));

    try {
      sessionStorage.removeItem('ursadefi_demo_session');
    } catch {}
  } catch {
    // private mode / quota — ignore
  }
}

/** Full entry: wipe + unique wallet. Use this from Try Demo. */
export function startFreshDemoSandbox(): { address: string; publicKey: string } {
  resetDemoLocalState();
  const wallet = createFreshDemoWallet();
  try {
    sessionStorage.setItem('ursadefi_demo_session', wallet.address);
  } catch {}
  return wallet;
}
