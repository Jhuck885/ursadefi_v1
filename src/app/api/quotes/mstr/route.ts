import { NextResponse } from 'next/server';

/**
 * Live MSTR (Strategy / MicroStrategy) quote.
 * Server-side to avoid browser CORS with Yahoo.
 */
export async function GET() {
  try {
    const url =
      'https://query1.finance.yahoo.com/v8/finance/chart/MSTR?interval=1d&range=5d';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UrsaDeFi/1.0)',
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const price = Number(meta?.regularMarketPrice);
    const prev = Number(meta?.chartPreviousClose ?? meta?.previousClose);

    if (!Number.isFinite(price)) {
      return NextResponse.json({ error: 'No price in response' }, { status: 502 });
    }

    const changePct =
      Number.isFinite(prev) && prev > 0
        ? ((price - prev) / prev) * 100
        : null;

    return NextResponse.json({
      symbol: 'MSTR',
      name: 'Strategy (MicroStrategy)',
      price,
      changePct,
      currency: meta?.currency || 'USD',
      source: 'Yahoo Finance',
    });
  } catch (error: any) {
    console.error('MSTR quote error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch MSTR' },
      { status: 500 }
    );
  }
}
