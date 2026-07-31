// src/types.ts — UNIFIED for MVP (matches InvoiceForm + XRPL NFT proof)
export type SettlementRail = 'xrpl_xrp' | 'xrpl_usdc' | 'x_money' | 'external';

export interface Invoice {
  id: string;
  from: string;
  to: string;
  items: Array<{ desc: string; qty: number; price: number }>;
  /** Amount due (subtotal + platform fee) */
  total: number;
  /** Service amount before platform fee */
  subtotal?: number;
  /** UrsaDeFi platform fee (USD) — max(subtotal × 0.15%, $0.25) */
  platformFee?: number;
  /** Fee rate applied (e.g. 0.0015) */
  feeRate?: number;
  xrpAmount: number;
  receiver: string;
  amount?: string;
  currency?: string;
  recipient?: string;
  description?: string;
  dueDate?: string;
  clientName?: string;
  companyTagline?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyFax?: string;
  clientAddress?: string;
  clientCityState?: string;
  nftoken_id?: string | null;
  nft_uri?: string | null;
  xrpl_tx_hash?: string | null;
  /** Client payment tx (if detected) */
  payment_tx_hash?: string | null;
  /** Platform fee tx */
  fee_tx_hash?: string | null;
  /** How the client settled */
  settlement_rail?: SettlementRail;
  created_at?: string;
  user_id?: string;
  status?: string;
  paymentUri?: string;
}

export interface XRPLWalletState {
  address: string | null;
  publicKey: string | null;
  isConnected: boolean;
  balance?: string;
}
