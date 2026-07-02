// src/types.ts — UNIFIED for MVP (matches InvoiceForm.tsx InvoiceData exactly + XRPL NFT proof)
// Keep auth.ts untouched for future Xaman wallet + Supabase MFA
export interface Invoice {
  id: string;
  from: string;
  to: string;
  items: Array<{ desc: string; qty: number; price: number }>;
  total: number;
  xrpAmount: number;
  receiver: string;
  // from your InvoiceData in auth.ts + form
  amount?: string;
  currency?: string;
  recipient?: string;
  description?: string;
  dueDate?: string;
  clientName?: string;
  // Company profile (for dynamic invoice PDF header)
  companyTagline?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyFax?: string;
  clientAddress?: string;
  clientCityState?: string;
  // on-chain immutable proof (deferred NFTokenMint)
  nftoken_id?: string | null;
  nft_uri?: string | null;
  xrpl_tx_hash?: string | null;
  created_at?: string;
  user_id?: string;
  status?: string; // "draft" | "minted" | "confirmed"
}

// Keep for future auth
export interface XRPLWalletState {
  address: string | null;
  publicKey: string | null;
  isConnected: boolean;
  balance?: string;
}