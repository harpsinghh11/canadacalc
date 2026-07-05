import {
  FEDERAL_BPA_MAX,
  FEDERAL_BPA_MIN,
  FEDERAL_BPA_PHASE_OUT_AMOUNT,
  FEDERAL_BPA_PHASE_OUT_END,
  FEDERAL_BPA_PHASE_OUT_RANGE,
  FEDERAL_BPA_PHASE_OUT_START,
  FEDERAL_BRACKETS,
  FEDERAL_ELIGIBLE_DTC_RATE,
  QUEBEC_FEDERAL_ABATEMENT,
} from "./constants";
import { calculateBracketTax } from "./brackets";
import {
  calculateFederalNonRefundableCredits,
  federalNonRefundableCreditBases,
  type FederalNonRefundableCredits,
} from "./contribution-tax";
import type { PensionContributionBreakdown } from "./contributions";

/** Federal BPA with income phase-out (T4127 BPAF formula). */
export function federalBasicPersonalAmount(netIncome: number): number {
  if (netIncome <= FEDERAL_BPA_PHASE_OUT_START) return FEDERAL_BPA_MAX;
  if (netIncome >= FEDERAL_BPA_PHASE_OUT_END) return FEDERAL_BPA_MIN;
  return (
    FEDERAL_BPA_MAX -
    (netIncome - FEDERAL_BPA_PHASE_OUT_START) *
      (FEDERAL_BPA_PHASE_OUT_AMOUNT / FEDERAL_BPA_PHASE_OUT_RANGE)
  );
}

export interface FederalTaxDetail {
  taxBeforeCredits: number;
  credits: FederalNonRefundableCredits;
  dividendTaxCredit: number;
  /** T3 / line 42900 — after K1, K2Q, and dividend credit (K3). */
  basicFederalTax: number;
  /** 16.5% of basicFederalTax for Quebec residents (line 44000). */
  quebecAbatement: number;
  taxAfterCredits: number;
}

export function calculateFederalIncomeTax(params: {
  taxableIncome: number;
  netIncome: number;
  grossedUpEligibleDividends: number;
  employmentIncome: number;
  province: string;
  pension: PensionContributionBreakdown;
  eiPremium: number;
  qpipPremium: number;
  selfEmployedBaseCredit?: number;
}): FederalTaxDetail {
  const {
    taxableIncome,
    netIncome,
    grossedUpEligibleDividends,
    employmentIncome,
    province,
    pension,
    eiPremium,
    qpipPremium,
    selfEmployedBaseCredit = 0,
  } = params;

  const isQuebec = province === "QC";
  const taxBeforeCredits = calculateBracketTax(taxableIncome, FEDERAL_BRACKETS);
  const bpa = federalBasicPersonalAmount(netIncome);

  const creditBases = federalNonRefundableCreditBases({
    employmentIncome,
    pension: {
      ...pension,
      base: pension.base + selfEmployedBaseCredit,
    },
    eiPremium,
    qpipPremium,
    basicPersonalAmount: bpa,
    isQuebec,
  });

  const credits = calculateFederalNonRefundableCredits(creditBases);
  const dividendTaxCredit =
    grossedUpEligibleDividends * FEDERAL_ELIGIBLE_DTC_RATE;

  const basicFederalTax = Math.max(
    0,
    taxBeforeCredits - credits.total - dividendTaxCredit,
  );

  const quebecAbatement = isQuebec
    ? basicFederalTax * QUEBEC_FEDERAL_ABATEMENT
    : 0;

  const taxAfterCredits = Math.max(0, basicFederalTax - quebecAbatement);

  return {
    taxBeforeCredits,
    credits,
    dividendTaxCredit,
    basicFederalTax,
    quebecAbatement,
    taxAfterCredits,
  };
}

/** Net federal income tax payable. */
export function federalIncomeTaxPayable(
  params: Parameters<typeof calculateFederalIncomeTax>[0],
): number {
  return calculateFederalIncomeTax(params).taxAfterCredits;
}
