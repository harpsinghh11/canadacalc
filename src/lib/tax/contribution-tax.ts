import {
  CANADA_EMPLOYMENT_AMOUNT,
  FEDERAL_BRACKETS,
  FEDERAL_LOWEST_RATE,
  TOP_UP_CREDIT_RATE_DELTA,
} from "./constants";
import type { PensionContributionBreakdown } from "./contributions";

export interface FederalNonRefundableCreditBases {
  basicPersonalAmount: number;
  canadaEmploymentAmount: number;
  basePensionContribution: number;
  eiPremium: number;
  /** Quebec only — K2Q / line 31205 (PPIP/QPIP premiums). */
  qpipPremium: number;
}

export interface FederalNonRefundableCredits {
  basicPersonal: number;
  canadaEmployment: number;
  basePension: number;
  ei: number;
  qpip: number;
  topUp: number;
  total: number;
}

export function federalCanadaEmploymentAmount(employmentIncome: number): number {
  if (employmentIncome <= 0) return 0;
  return Math.min(employmentIncome, CANADA_EMPLOYMENT_AMOUNT);
}

export function federalNonRefundableCreditBases(params: {
  employmentIncome: number;
  pension: PensionContributionBreakdown;
  eiPremium: number;
  qpipPremium: number;
  basicPersonalAmount: number;
  isQuebec: boolean;
}): FederalNonRefundableCreditBases {
  return {
    basicPersonalAmount: params.basicPersonalAmount,
    canadaEmploymentAmount: federalCanadaEmploymentAmount(
      params.employmentIncome,
    ),
    basePensionContribution: params.pension.base,
    eiPremium: params.eiPremium,
    qpipPremium: params.isQuebec ? params.qpipPremium : 0,
  };
}

/**
 * Top-up tax credit (line 34990) — Bill C-15, 2026–2030.
 * Applies 1% on eligible credit bases above the first federal bracket.
 */
export function federalTopUpTaxCredit(
  creditBases: FederalNonRefundableCreditBases,
): number {
  const totalBase =
    creditBases.basicPersonalAmount +
    creditBases.canadaEmploymentAmount +
    creditBases.basePensionContribution +
    creditBases.eiPremium +
    creditBases.qpipPremium;
  const threshold = FEDERAL_BRACKETS[0].max;
  return Math.max(0, totalBase - threshold) * TOP_UP_CREDIT_RATE_DELTA;
}

export function calculateFederalNonRefundableCredits(
  creditBases: FederalNonRefundableCreditBases,
): FederalNonRefundableCredits {
  const basicPersonal = creditBases.basicPersonalAmount * FEDERAL_LOWEST_RATE;
  const canadaEmployment =
    creditBases.canadaEmploymentAmount * FEDERAL_LOWEST_RATE;
  const basePension =
    creditBases.basePensionContribution * FEDERAL_LOWEST_RATE;
  const ei = creditBases.eiPremium * FEDERAL_LOWEST_RATE;
  const qpip = creditBases.qpipPremium * FEDERAL_LOWEST_RATE;
  const topUp = federalTopUpTaxCredit(creditBases);
  return {
    basicPersonal,
    canadaEmployment,
    basePension,
    ei,
    qpip,
    topUp,
    total:
      basicPersonal +
      canadaEmployment +
      basePension +
      ei +
      qpip +
      topUp,
  };
}

export interface ProvincialNonRefundableCreditBases {
  basicPersonalAmount: number;
  basePensionContribution: number;
  eiPremium: number;
  qpipPremium: number;
}

export interface ProvincialNonRefundableCredits {
  basicPersonal: number;
  basePension: number;
  ei: number;
  qpip: number;
  total: number;
}

/**
 * Provincial non-refundable credits.
 * Quebec: only the basic personal amount — QPP/EI/QPIP are reflected in the
 * Quebec basic personal amount (Revenu Québec), not as separate credits.
 */
export function calculateProvincialNonRefundableCredits(
  province: string,
  creditBases: ProvincialNonRefundableCreditBases,
  lowestRate: number,
): ProvincialNonRefundableCredits {
  const basicPersonal = creditBases.basicPersonalAmount * lowestRate;

  if (province === "QC") {
    return {
      basicPersonal,
      basePension: 0,
      ei: 0,
      qpip: 0,
      total: basicPersonal,
    };
  }

  const basePension = creditBases.basePensionContribution * lowestRate;
  const ei = creditBases.eiPremium * lowestRate;
  const qpip = 0;
  return {
    basicPersonal,
    basePension,
    ei,
    qpip,
    total: basicPersonal + basePension + ei + qpip,
  };
}

/** Enhanced CPP/QPP (first additional + CPP2/QPP2) — line 22215 deduction. */
export function enhancedPensionDeduction(
  pension: PensionContributionBreakdown,
  selfEmployedEnhancedDeduction = 0,
): number {
  return (
    pension.firstAdditional +
    pension.secondAdditional +
    selfEmployedEnhancedDeduction
  );
}
