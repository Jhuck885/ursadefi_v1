/**
 * XRPL settlement assets for UrsaDeFi invoices.
 * Native XRP plus issued stablecoins (trustline required).
 */

export type AssetId = 'XRP' | 'RLUSD' | 'USDC';

export interface IssuedAsset {
  id: AssetId;
  label: string;
  symbol: string;
  kind: 'native' | 'issued';
  /** 3-char ISO or 160-bit hex currency code used on ledger */
  currency: string;
  issuer?: string;
  decimals: number;
  peggedUsd: boolean;
  notes: string;
}

/** Ripple USD — official XRPL issuer */
export const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';
export const RLUSD_CURRENCY_HEX = '524C555344000000000000000000000000000000';

/** Circle USDC — official XRPL issuer */
export const USDC_ISSUER = 'rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE';
export const USDC_CURRENCY_HEX = '5553444300000000000000000000000000000000';

export const ASSETS: Record<AssetId, IssuedAsset> = {
  XRP: {
    id: 'XRP',
    label: 'XRP',
    symbol: 'XRP',
    kind: 'native',
    currency: 'XRP',
    decimals: 6,
    peggedUsd: false,
    notes: 'Native XRPL asset. No trustline.',
  },
  RLUSD: {
    id: 'RLUSD',
    label: 'Ripple USD',
    symbol: 'RLUSD',
    kind: 'issued',
    currency: RLUSD_CURRENCY_HEX,
    issuer: RLUSD_ISSUER,
    decimals: 6,
    peggedUsd: true,
    notes: 'NYDFS-regulated USD stablecoin issued by Ripple on XRPL.',
  },
  USDC: {
    id: 'USDC',
    label: 'USD Coin',
    symbol: 'USDC',
    kind: 'issued',
    currency: USDC_CURRENCY_HEX,
    issuer: USDC_ISSUER,
    decimals: 6,
    peggedUsd: true,
    notes: 'Circle-issued native USDC on XRPL.',
  },
};

export const DEFAULT_ASSET: AssetId = 'RLUSD';
export const SETTLEMENT_ASSETS: AssetId[] = ['RLUSD', 'USDC', 'XRP'];

export function getAsset(id?: string | null): IssuedAsset {
  const key = (id || DEFAULT_ASSET).toUpperCase() as AssetId;
  return ASSETS[key] || ASSETS.RLUSD;
}

export function isIssued(id?: string | null): boolean {
  return getAsset(id).kind === 'issued';
}

/** XRPL Payment Amount field */
export function toXrplAmount(assetId: AssetId, value: number | string) {
  const asset = getAsset(assetId);
  const v = typeof value === 'number' ? value.toFixed(asset.decimals) : String(value);
  if (asset.kind === 'native') {
    const drops = Math.max(1, Math.round(Number(v) * 1_000_000));
    return String(drops);
  }
  return {
    currency: asset.currency,
    issuer: asset.issuer as string,
    value: Number(v).toFixed(asset.decimals),
  };
}

export function parseXrplAmount(amount: unknown): {
  assetId: AssetId | 'UNKNOWN';
  value: number;
  issuer?: string;
} {
  if (typeof amount === 'string') {
    return { assetId: 'XRP', value: Number(amount) / 1_000_000 };
  }
  if (amount && typeof amount === 'object') {
    const a = amount as { currency?: string; issuer?: string; value?: string };
    const cur = (a.currency || '').toUpperCase();
    const issuer = a.issuer || '';
    if (issuer === RLUSD_ISSUER || cur.includes('524C555344') || cur === 'RLUSD') {
      return { assetId: 'RLUSD', value: Number(a.value), issuer };
    }
    if (issuer === USDC_ISSUER || cur.includes('55534443') || cur === 'USDC') {
      return { assetId: 'USDC', value: Number(a.value), issuer };
    }
    return { assetId: 'UNKNOWN', value: Number(a.value), issuer };
  }
  return { assetId: 'UNKNOWN', value: 0 };
}

export function settlementRailFor(assetId: AssetId) {
  if (assetId === 'XRP') return 'xrpl_xrp' as const;
  if (assetId === 'USDC') return 'xrpl_usdc' as const;
  return 'xrpl_rlusd' as const;
}
