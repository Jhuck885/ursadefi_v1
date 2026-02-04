export interface XRPLWalletState {
  address: string | null;
  publicKey: string | null;
  isConnected: boolean;
  balance?: string;
}

export interface InvoiceData {
  amount: string;
  currency: string;
  recipient: string;
  memo?: string;
  description?: string;
  dueDate?: string;
  clientName?: string;
}
