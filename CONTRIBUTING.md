# Contributing to UrsaDeFi

Thanks for helping. This project is founder-led (BDFL-style). Keep changes small, focused, and safe for a non-custodial financial UI.

## Ground rules

1. **Issues first** for non-trivial work — open or claim an issue before a large PR.
2. **One concern per PR** — bugfix, feature, or docs; not all three.
3. **Do not commit secrets** — no API keys, seed phrases, private keys, or real `.env` files.
4. **Do not hardcode personal fee wallets** — use `PLATFORM_FEE_RECEIVER` / env.
5. **Preserve non-custodial behavior** — never collect or store user seeds or private keys.
6. **Keep `main` deployable** — if CI or `npm run build` fails, fix before merge.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use Testnet + a dedicated Xaman test account when exercising fee/mint flows.

## Branch & PR

1. Branch from `main`: `fix/...`, `feat/...`, or `docs/...`
2. Make the change
3. `npm run build` (and lint if you touch shared UI)
4. Open a PR against `main` with:
   - What problem it solves
   - How you tested (Demo / Xaman Testnet / Mainnet)
   - Screenshots for UI changes

## Code preferences

- TypeScript, App Router patterns already in the repo
- Prefer existing components and CSS variables over new one-off styles
- Invoice lifecycle is intentional: draft → paid/settled (fee) → optional mint
- Avoid drive-by refactors of unrelated files

## What we will reject

- PRs that embed secrets or personal mainnet keys
- Custodial “hold user funds” designs
- Unscoped rewrites without an issue and discussion
- Generated noise (lockfile churn without dependency need)

## License

By contributing, you agree your contributions are licensed under the **GNU Affero General Public License v3.0** (see [LICENSE](./LICENSE)).
