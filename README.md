# UrsaDeFi: DeFi Invoicing SaaS for Freelancers – XRPL MPT Invoices + RWA Creation

Perfect MVP release: Inspired by x.com – clean dark UI, responsive cards, secure XRPL integration.

## Getting Started

1. Clone repo: `git clone https://github.com/Jhuck885/ursadefi.git`
2. Install deps: `npm install`
3. Set env (copy .env.example to .env.local): NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS=rNb4AKqA6QwhD8Nfff7rVxg5RPmyTE1vVn
4. Run dev: `npm run dev` – open http://localhost:3000
5. For backend: cd ursadefi-backend && cargo run

## Features
- Login with XRPL wallet
- Dashboard with live XRP prices, payments feed
- Create recurring invoices, generate PDF, mint MPT as RWA
- UI like x.com: Dark mode, card feed, responsive columns

## Learn More
- Next.js Docs: [documentation](https://nextjs.org/docs)
- XRPL Integration: [xrpl.js](https://js.xrpl.org/)
- Deploy on Vercel: [vercel.com](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

## Deployment
Deploy the frontend on Vercel for free. Backend on Heroku/AWS for Rust API.