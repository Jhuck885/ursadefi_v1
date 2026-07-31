import { NextRequest, NextResponse } from 'next/server';
import { calcPlatformFee, PLATFORM_FEE_PERCENT_LABEL, MIN_PLATFORM_FEE_USD } from '@/lib/constants';
import { canUsePlatformFeatures, isSettled, isPaidFeeDue, statusLabel } from '@/lib/invoice-status';

/**
 * Lightweight MCP-style tool surface for AI agents (GEO / agent discovery).
 * POST { tool, arguments }
 */
export async function GET() {
  return NextResponse.json({
    name: 'UrsaDeFi',
    version: '1.0',
    description:
      'Non-custodial XRPL invoicing. Free drafts. Platform fee 0.15% (min $0.25) when invoice is paid. No monthly fee. Tax CSV US · Europe · Japan after settled.',
    tools: [
      {
        name: 'get_product_rules',
        description: 'Fee model, non-custodial rules, regional tax CSV support',
      },
      {
        name: 'quote_platform_fee',
        description: 'Quote 0.15% platform fee from USD subtotal',
        parameters: { subtotalUsd: 'number' },
      },
      {
        name: 'invoice_feature_gate',
        description: 'Whether CSV/mint unlock for a given status',
        parameters: { status: 'string' },
      },
      {
        name: 'list_settlement_rails',
        description: 'Supported settlement options (non-custodial)',
      },
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tool = String(body.tool || body.name || '');
    const args = body.arguments || body.args || {};

    switch (tool) {
      case 'get_product_rules':
        return NextResponse.json({
          non_custodial: true,
          monthly_fee: false,
          platform_fee_rate: PLATFORM_FEE_PERCENT_LABEL,
          platform_fee_min_usd: MIN_PLATFORM_FEE_USD,
          fee_when: 'client_paid',
          unlock_on_settled: ['tax_csv', 'mint_nft'],
          tax_regions: ['US', 'Europe', 'Japan'],
          keys: 'Xaman — user holds keys',
          settlement_rails: ['xrpl_xrp', 'xrpl_usdc', 'x_money', 'external'],
        });

      case 'quote_platform_fee': {
        const subtotal = Number(args.subtotalUsd ?? args.subtotal ?? 0);
        const fee = calcPlatformFee(subtotal);
        return NextResponse.json({
          subtotalUsd: subtotal,
          feeUsd: fee,
          rate: PLATFORM_FEE_PERCENT_LABEL,
          minUsd: MIN_PLATFORM_FEE_USD,
          note: 'Fee due after client pays; unlocks tax CSV and mint',
        });
      }

      case 'invoice_feature_gate': {
        const status = String(args.status || 'draft');
        return NextResponse.json({
          status,
          label: statusLabel(status),
          paid_fee_due: isPaidFeeDue(status),
          settled: isSettled(status),
          can_export_tax_csv: canUsePlatformFeatures(status),
          can_mint: canUsePlatformFeatures(status),
          fee_required: !canUsePlatformFeatures(status),
        });
      }

      case 'list_settlement_rails':
        return NextResponse.json({
          rails: [
            {
              id: 'xrpl_xrp',
              label: 'XRP on XRPL',
              custodial: false,
              primary: true,
            },
            {
              id: 'xrpl_usdc',
              label: 'USDC on XRPL',
              custodial: false,
              primary: false,
              note: 'Requires trust line to issuer',
            },
            {
              id: 'x_money',
              label: 'X Money',
              custodial: false,
              primary: false,
              note: 'Optional off-XRPL rail; user records settlement',
            },
            {
              id: 'external',
              label: 'External / bank / other',
              custodial: false,
              primary: false,
            },
          ],
        });

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}`, hint: 'GET /api/mcp for tool list' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'MCP error' }, { status: 500 });
  }
}
