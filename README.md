# UrsaDeFi: DeFi Invoicing SaaS for Freelancers – XRPL MPT Invoices + RWA Creation

**Phase 4 Uplift Complete** (June 2026): Full functional invoice creation flow, live XRP price + on-chain recent payments, wallet integration, CSV export, Supabase-ready persistence, polished x.com-style dark UI.

MVP foundation shipped Feb 2026. Now core loops work end-to-end in demo mode (localStorage). Production features (real Xaman sign-in, Supabase persistence, server PDF) require simple env + Supabase setup (see below).

## Live Demo
https://ursadefi-v1.vercel.app

## Key Features (Current)
- Connect with Xaman (demo + QR path)
- Dashboard: 3-column layout (left nav, invoice feed + form/modal, right with live XRP + recent testnet payments + tax overview)
- Create Invoice: Full form with dynamic line items, auto totals, XRP estimate, due date
- Save to localStorage (immediate) + Supabase stub ready
- Browser PDF (print-to-PDF + QR payment + email trigger)
- Mint as XRPL NFToken (testnet via Xumm deep link, invoice JSON in memo)
- CSV Export (one-click download of all invoices)
- Live XRP price (CoinGecko + 24h change, auto-refresh)
- Recent incoming payments from XRPL testnet (auto-refresh)
- Wallet persistence (localStorage via context)
- Dark x.com-inspired responsive UI + theme toggle

## Roadmap / Next (Phase 5+)
- Real Xaman sign-in + callback to capture address (currently demo strong)
- Full Supabase persistence + RLS + user association by wallet
- Recurring invoices (toggle + schedule)
- MPT issuance for true RWAs (instead of/in addition to NFToken)
- Production Xumm backend (secure payload creation)
- 1099/CSV tax export polish + reports
- XFreelance SaaS integration (X payments + IRS compliance)
- Deploy pdf-service microservice for premium PDFs

## Getting Started (Local)

1. Clone: `git clone https://github.com/Jhuck885/ursadefi_v1.git`
2. `npm install`
3. Copy `.env.example` → `.env.local` and fill values (see Setup section)
4. `npm run dev`
5. Open http://localhost:3000 — use demo connect to reach dashboard

## Deployment
- Frontend: Vercel (auto from main branch)
- Set the 4 NEXT_PUBLIC_ env vars in Vercel Project Settings → Environment Variables
- Backend PDF service: Deploy ursadefi-pdf-service separately when ready

## Setup for Full Features (Required for Prod)

### 1. Xumm / Xaman API Key
- Go to https://xumm.app (or developer.xumm.app)
- Create free account / app
- Get API Key (publishable for MVP)
- Add as NEXT_PUBLIC_XUMM_API_KEY
- For production: Move payload creation to secure backend route

### 2. Supabase (Persistence)
- Create free project at supabase.com
- Go to Project Settings → API → copy URL + anon public key
- Add to env vars
- Create table `invoices` (SQL below)
- (Optional) Enable RLS and policies for wallet_address = auth.uid() or similar once auth wired

```sql
create table invoices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  wallet_address text not null,
  from_name text,
  to_name text,
  items jsonb not null default '[]',
  total numeric,
  xrp_amount numeric,
  receiver text,
  due_date date,
  description text,
  status text default 'draft',           -- draft | minted | confirmed | paid
  nftoken_id text,
  xrpl_tx_hash text,
  nft_uri text
);

-- Optional index
create index on invoices (wallet_address);

-- Example RLS (after auth setup)
-- alter table invoices enable row level security;
-- create policy "Users can CRUD own invoices" on invoices for all using (wallet_address = auth.uid()::text);
```

### 3. XRPL Receiver Address
- Use the test one or your own XRPL account (for incoming payments display)
- Already in .env.example

## Environment Variables
See `.env.example`. All NEXT_PUBLIC_ are exposed to browser (safe for MVP keys).

## Known Limitations (MVP)
- Xaman connect is demo-strong (real payload signing works in mint; full SignIn callback can be added next)
- Invoices persist in localStorage by default (Supabase code stub ready — just uncomment)
- Form works in both inline dashboard and RightSidebar modal
- Testnet only for on-chain mint/payments
- No recurring or MPT yet (stubs ready for extension)

## Tech Stack
Next.js 16 (App Router) + TypeScript + Tailwind + Supabase + xrpl.js + xumm-sdk + react-hook-form + Lucide

Built in Dallas, TX — UrsaDeFi by VERTmetaX