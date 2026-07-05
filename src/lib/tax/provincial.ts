import {
  BC_TAX_REDUCTION_MAX,
  BC_TAX_REDUCTION_PHASE_OUT_END,
  BC_TAX_REDUCTION_PHASE_OUT_START,
  FEDERAL_BRACKETS,
  MANITOBA_BPA_MAX,
  ON_SURTAX_THRESHOLD_1,
  ON_SURTAX_THRESHOLD_2,
  ON_TAX_REDUCTION_BASE,
  PROVINCIAL_BASIC_AMOUNTS,
  PROVINCIAL_BRACKETS,
  PROVINCIAL_ELIGIBLE_DTC_RATES,
  PROVINCIAL_LOWEST_RATES,
  QUEBEC_FEDERAL_ABATEMENT,
} from "./constants";
import { calculateBracketTax, getMarginalBracketRate } from "./brackets";
import {
  calculateProvincialNonRefundableCredits,
  type ProvincialNonRefundableCredits,
} from "./contribution-tax";
import type { PensionContributionBreakdown } from "./contributions";
import { federalBasicPersonalAmount } from "./federal";
import { provincialEligibleDividendCredit } from "./dividends";

function provincialBasicAmount(
  province: string,
  netIncome: number,
): number {
  const entry = PROVINCIAL_BASIC_AMOUNTS[province];
  if (entry === "formula_mb") {
    if (netIncome <= 200_000) return MANITOBA_BPA_MAX;
    if (netIncome >= 400_000) return 0;
    return (
      MANITOBA_BPA_MAX -
      (netIncome - 200_000) * (MANITOBA_BPA_MAX / 200_000)
    );
  }
  if (entry === "formula_yt") {
    return federalBasicPersonalAmount(netIncome);
  }
  return typeof entry === "number" ? entry : 0;
}

function ontarioHealthPremium(taxableIncome: number): number {
  const a = taxableIncome;
  if (a <= 20_000) return 0;
  if (a <= 36_000) return Math.min(300, 0.06 * (a - 20_000));
  if (a <= 48_000) return Math.min(450, 300 + 0.06 * (a - 36_000));
  if (a <= 72_000) return Math.min(600, 450 + 0.25 * (a - 48_000));
  if (a <= 200_000) return Math.min(750, 600 + 0.25 * (a - 72_000));
  return Math.min(900, 750 + 0.25 * (a - 200_000));
}

function ontarioSurtax(basicProvincialTax: number): number {
  const t4 = basicProvincialTax;
  if (t4 <= ON_SURTAX_THRESHOLD_1) return 0;
  if (t4 <= ON_SURTAX_THRESHOLD_2) {
    return 0.2 * (t4 - ON_SURTAX_THRESHOLD_1);
  }
  return (
    0.2 * (ON_SURTAX_THRESHOLD_2 - ON_SURTAX_THRESHOLD_1) +
    0.36 * (t4 - ON_SURTAX_THRESHOLD_2)
  );
}

function ontarioTaxReduction(basicProvincialTax: number): number {
  const surtax = ontarioSurtax(basicProvincialTax);
  const cap = 2 * ON_TAX_REDUCTION_BASE;
  return Math.max(0, Math.min(basicProvincialTax + surtax, cap - (basicProvincialTax + surtax)));
}

function bcTaxReduction(
  taxableIncome: number,
  basicProvincialTax: number,
): number {
  const a = taxableIncome;
  if (a <= BC_TAX_REDUCTION_PHASE_OUT_START) {
    return Math.min(basicProvincialTax, BC_TAX_REDUCTION_MAX);
  }
  if (a <= BC_TAX_REDUCTION_PHASE_OUT_END) {
    const maxReduction =
      BC_TAX_REDUCTION_MAX - (a - BC_TAX_REDUCTION_PHASE_OUT_START) * 0.0356;
    return Math.min(basicProvincialTax, Math.max(0, maxReduction));
  }
  return 0;
}

export interface ProvincialTaxDetail {
  taxBeforeCredits: number;
  credits: ProvincialNonRefundableCredits;
  surtax: number;
  healthPremium: number;
  lowIncomeReduction: number;
  taxAfterCredits: number;
}

export function calculateProvincialIncomeTax(params: {
  province: string;
  taxableIncome: number;
  netIncome: number;
  grossedUpEligibleDividends: number;
  pension: PensionContributionBreakdown;
  eiPremium: number;
  qpipPremium: number;
  selfEmployedBaseCredit?: number;
}): ProvincialTaxDetail {
  const {
    province,
    taxableIncome,
    netIncome,
    grossedUpEligibleDividends,
    pension,
    eiPremium,
    qpipPremium,
    selfEmployedBaseCredit = 0,
  } = params;
  const brackets = PROVINCIAL_BRACKETS[province] ?? [];
  const lowestRate = PROVINCIAL_LOWEST_RATES[province] ?? 0;

  const taxBeforeCredits = calculateBracketTax(taxableIncome, brackets);
  const bpa = provincialBasicAmount(province, netIncome);

  const credits = calculateProvincialNonRefundableCredits(
    province,
    {
      basicPersonalAmount: bpa,
      basePensionContribution: pension.base + selfEmployedBaseCredit,
      eiPremium,
      qpipPremium: province === "QC" ? qpipPremium : 0,
    },
    lowestRate,
  );

  let basicTax = taxBeforeCredits - credits.total;
  basicTax -= provincialEligibleDividendCredit(
    province,
    grossedUpEligibleDividends,
    PROVINCIAL_ELIGIBLE_DTC_RATES,
  );
  basicTax = Math.max(0, basicTax);

  let surtax = 0;
  let healthPremium = 0;
  let lowIncomeReduction = 0;

  if (province === "ON") {
    surtax = ontarioSurtax(basicTax);
    healthPremium = ontarioHealthPremium(taxableIncome);
    lowIncomeReduction = ontarioTaxReduction(basicTax);
  }

  if (province === "BC") {
    lowIncomeReduction = bcTaxReduction(taxableIncome, basicTax);
  }

  const taxAfterCredits =
    basicTax + surtax + healthPremium - lowIncomeReduction;

  return {
    taxBeforeCredits,
    credits,
    surtax,
    healthPremium,
    lowIncomeReduction,
    taxAfterCredits,
  };
}

/** Net provincial/territorial income tax payable. */
export function provincialIncomeTaxPayable(
  params: Parameters<typeof calculateProvincialIncomeTax>[0],
): number {
  return calculateProvincialIncomeTax(params).taxAfterCredits;
}

export function getCombinedMarginalRate(
  taxableIncome: number,
  province: string,
): number {
  const federalRate = getMarginalBracketRate(taxableIncome, FEDERAL_BRACKETS);
  const provincialBrackets = PROVINCIAL_BRACKETS[province] ?? [];
  const provincialRate = getMarginalBracketRate(taxableIncome, provincialBrackets);

  if (province === "QC") {
    return federalRate * (1 - QUEBEC_FEDERAL_ABATEMENT) + provincialRate;
  }
  return federalRate + provincialRate;
}
