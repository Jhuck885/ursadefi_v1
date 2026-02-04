// src/app/api/get-address/route.ts
// TEMP — delete after funding

import { NextResponse } from 'next/server';
import { Wallet } from 'xrpl';

export async function GET() {
  const seed = process.env.XRPL_TEST_SEED;

  if (!seed) {
    return NextResponse.json({ error: 'XRPL_TEST_SEED missing in .env.local' }, { status: 500 });
  }

  const wallet = Wallet.fromSeed(seed);

  return NextResponse.json({
    receiverAddress: wallet.classicAddress,
    instructions: 'Copy address → fund at https://faucet.devnet.rippletest.net → add NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS to .env.local → restart dev → delete this file/folder'
  });
}