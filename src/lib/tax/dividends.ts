import { FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP } from "./constants";

export function grossUpEligibleDividends(eligibleDividends: number): number {
  return eligibleDividends * (1 + FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP);
}

/**
 * Eligible dividend methodology:
 * - 38% federal gross-up (Income Tax Act s.82)
 * - Federal DTC 15.0198% of grossed-up amount
 * - Provincial DTC % of grossed-up amount (see constants; 2022–2026 stable rates)
 * Non-eligible dividends are NOT modeled.
 */
export function provincialEligibleDividendCredit(
  province: string,
  grossedUpAmount: number,
  rates: Record<string, number>,
): number {
  const rate = rates[province] ?? 0;
  return grossedUpAmount * rate;
}
