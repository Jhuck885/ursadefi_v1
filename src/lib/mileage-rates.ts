/**
 * Official / published travel distance rates for bookkeeping helpers.
 * Sources noted inline. Not tax advice — confirm before filing.
 *
 * Amounts are in local units as published (USD per mile, EUR per km).
 * Expense form still lets user override.
 */

export type MileageRegion = 'us' | 'europe' | 'japan';
export type DistanceUnit = 'mi' | 'km';

export interface OfficialRatePreset {
  region: MileageRegion;
  label: string;
  unit: DistanceUnit;
  /** Default numeric rate applied in the form */
  defaultRate: number;
  /** Short UI label for the rate */
  rateLabel: string;
  /** Attribution for GEO / help */
  source: string;
  /** Extra rules (date splits, scales, etc.) */
  detail: string;
}

/** IRS business standard mileage rate for a given trip date (2026). */
export function irsBusinessRatePerMile(tripDateIso: string): number {
  // 2026 H1: $0.725 (Notice 2026-10) · H2 from Jul 1: $0.76 (Announcement 2026-11)
  const d = tripDateIso || '';
  if (d >= '2026-07-01') return 0.76;
  if (d >= '2026-01-01') return 0.725;
  // Fallback if no date / other year — use current H2 2026 business rate
  return 0.76;
}

export function getOfficialPreset(region: MileageRegion, tripDateIso: string): OfficialRatePreset {
  if (region === 'us') {
    const rate = irsBusinessRatePerMile(tripDateIso);
    const half =
      tripDateIso >= '2026-07-01'
        ? 'Jul 1 – Dec 31, 2026'
        : tripDateIso >= '2026-01-01'
          ? 'Jan 1 – Jun 30, 2026'
          : '2026 business rate';
    return {
      region: 'us',
      label: 'United States',
      unit: 'mi',
      defaultRate: rate,
      rateLabel: `$${rate.toFixed(3)} / mi`,
      source: 'IRS optional standard mileage rate (business)',
      detail: `${half}: $${rate.toFixed(3)}/mi business. Charity $0.14/mi; medical/moving $${tripDateIso >= '2026-07-01' ? '0.235' : '0.205'}/mi. Source: IRS.gov.`,
    };
  }

  if (region === 'europe') {
    // No single EU rate. Germany flat €0.30/km is the most common simple official reimbursement reference.
    // France uses barème kilométrique by CV and distance bands (not a single rate).
    return {
      region: 'europe',
      label: 'Europe',
      unit: 'km',
      defaultRate: 0.3,
      rateLabel: '€0.30 / km (DE reference)',
      source: 'Germany: €0.30/km standard; France: barème kilométrique 2026 by CV',
      detail:
        'EU has no single rate. Default uses Germany €0.30/km. France 2026 barème (unchanged): e.g. 5 CV ≤5,000 km = €0.636/km; scales by fiscal HP and distance band. Override rate for your country.',
    };
  }

  // Japan: no IRS-style published ¥/km standard for freelancers; actual costs / company rules dominate.
  return {
    region: 'japan',
    label: 'Japan',
    unit: 'km',
    defaultRate: 0,
    rateLabel: 'Actual cost (no national ¥/km standard)',
    source: 'Japan — actual expense method / employer policy',
    detail:
      'Japan does not publish a single national business ¥/km rate like the IRS. Track actual fuel, tolls, transit, or your company’s reimbursement rate. Enter amount manually or set a company rate.',
  };
}

export const MILEAGE_REGIONS: MileageRegion[] = ['us', 'europe', 'japan'];
