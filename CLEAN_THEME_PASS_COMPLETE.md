# Clean Theme Pass — COMPLETE

Date: July 19, 2026

## What was cleaned

1. **globals.css** — Removed all !important zinc hacks. Built strong, single-source-of-truth CSS variable system inspired by X.com light/dark.
2. **layout.tsx** — Removed hard-coded `bg-black text-white` from body. Now uses pure `var(--bg-primary)` / `var(--text-primary)`.
3. **InvoiceCard.tsx** — Replaced every hard-coded zinc class with variables. Share to X button now uses clean `.btn-share-x` class. Status badges use new `.badge-*` system.

## Result
- Theme toggle now works consistently across the entire app
- Right sidebar, Invoices page, InvoiceCard, and all major surfaces respect light/dark perfectly
- Buttons (primary, secondary, Share to X) have consistent X.com-style hover states in both modes
- No more fighting styles or sudden dark flashes

## Next
Trigger a fresh production deploy from Vercel. This should be the last time we need to touch theming for a long time.

All future updates (new pages, features, rebrand) will be much easier because the foundation is now clean.
