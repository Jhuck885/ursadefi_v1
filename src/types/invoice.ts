export interface Invoice {
  id: string;
  created_at: string;
  user_id: string;

  // <<< REPLACE WITH YOUR EXACT EXISTING FIELDS >>>
  // Look at your InvoiceForm state / Supabase insert fields and add them here with correct types
  // Examples based on typical invoicing apps:
  invoice_number: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency?: string;
  due_date?: string;
  description?: string;
  status?: string;
  // If you store items/line items, add array here
  // If you already store pdf_url, add it:
  pdf_url?: string;

  // NEW ON-CHAIN PROOF FIELDS (already in your Supabase table)
  nftoken_id?: string | null;
  nft_uri?: string | null;
  xrpl_tx_hash?: string | null;
}