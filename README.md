# UrsaDeFi

Non-custodial XRPL invoicing for freelancers and small businesses.

Bill in USD · settle in XRP · keys stay in [Xaman](https://xaman.app) · optional invoice NFTs on the XRP Ledger.

**License:** [AGPL-3.0](./LICENSE)  
**Status:** early public / pre-1.0 — usable, still hardening

## What it does

- Create invoices and clients
- Connect with Xaman (no passwords; non-custodial)
- Platform fee **0.15%** (minimum **$0.25**) when an invoice is settled
- Optional mint of paid invoices as XRPL NFTs (minimum **$50** service amount)
- Regional tax-oriented CSV helpers (US / Europe / Japan) on the Reports page
- Demo mode for UI exploration without a real wallet

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Xaman (Xumm) SDK for signing
- XRPL
- Supabase (optional persistence)

## Quick start

```bash
git clone https://github.com/Jhuck885/ursadefi_v1.git
cd ursadefi_v1
npm install
cp .env.example .env.local
# fill in XUMM + Supabase + PLATFORM_FEE_RECEIVER
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

See [`.env.example`](./.env.example).

| Variable | Required | Notes |
|----------|----------|--------|
| `XUMM_API_KEY` / `XUMM_API_SECRET` | Yes (real Xaman) | Server-only; never commit real values |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | Persistence |
| `PLATFORM_FEE_RECEIVER` | Yes for fees | XRPL classic address that receives platform fees |
| `NEXT_PUBLIC_PLATFORM_FEE_RECEIVER` | Optional | Same address if the client must display it |

**Never commit** `.env`, `.env.local`, or real API keys.

## Product rules (code)

Defined in `src/lib/constants.ts`:

- Min invoice: **$25**
- Min mint: **$50**
- Fee: **0.15%**, floor **$0.25**

## Open source model

- **License:** AGPL-3.0 — if you run a modified version as a network service, you must offer the corresponding source to users of that service.
- **Governance:** founder-led (BDFL-style) for now; clear PRs preferred over drive-by redesigns.
- **Contributions:** see [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Security reports:** see [SECURITY.md](./SECURITY.md)

Hosted product, trademark, and brand (**UrsaDeFi**) remain under the project owner even when the code is free.

## Security notes

- Non-custodial by design: private keys never leave Xaman
- Platform fee is a normal XRPL Payment signed by the user
- Fee destination is configuration, not a secret — but do not hardcode personal wallets in public forks; set `PLATFORM_FEE_RECEIVER` in env

## Disclaimer

Not financial, legal, or tax advice. CSV exports are bookkeeping helpers. Confirm filings with a qualified professional.

## Links

- Live product: configure your own deploy (e.g. Vercel)
- XRPL: https://xrpl.org
- Xaman: https://xaman.app
