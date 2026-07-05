import {
  CPP_BASE_RATE,
  CPP_FIRST_ADDITIONAL_RATE,
  CPP_MAX_EMPLOYEE_TIER1,
  CPP_MAX_EMPLOYEE_TIER2,
  CPP_SECOND_ADDITIONAL_RATE,
  EI_MAX_INSURABLE,
  EI_MAX_PREMIUM,
  EI_MAX_PREMIUM_QC,
  EI_RATE,
  EI_RATE_QC,
  PENSION_BASIC_EXEMPTION,
  PENSION_YAMCE,
  PENSION_YMCE,
  PENSION_YMPE,
  QPIP_MAX_INSURABLE,
  QPIP_MAX_PREMIUM,
  QPIP_RATE,
  QPP_BASE_RATE,
  QPP_FIRST_ADDITIONAL_RATE,
  QPP_MAX_EMPLOYEE_TIER1,
} from "./constants";

/** Employee pension split for income-tax treatment (CRA lines 30800 / 22215). */
export interface PensionContributionBreakdown {
  /** Base CPP/QPP — non-refundable tax credit (line 30800). */
  base: number;
  /** First additional — taxable income deduction (line 22215). */
  firstAdditional: number;
  /** CPP2/QPP2 — taxable income deduction (line 22215). */
  secondAdditional: number;
  /** Tier-1 cash total (base + first additional). */
  tier1: number;
  /** Tier-2 cash total. */
  tier2: number;
  /** Total employee pension premium paid. */
  total: number;
}

export type PensionResult = PensionContributionBreakdown;

function tier1PensionableEarnings(employmentIncome: number): number {
  return Math.min(
    Math.max(0, employmentIncome - PENSION_BASIC_EXEMPTION),
    PENSION_YMCE,
  );
}

function tier2PensionableEarnings(employmentIncome: number): number {
  return Math.min(
    Math.max(0, employmentIncome - PENSION_YMPE),
    PENSION_YAMCE,
  );
}

/** Tier 1: YMPE range. Tier 2 (CPP2/QPP2): earnings between YMPE and YAMPE only. */
export function calculateEmployeePension(
  employmentIncome: number,
  isQuebec: boolean,
): PensionContributionBreakdown {
  const pensionable = tier1PensionableEarnings(employmentIncome);
  const baseRate = isQuebec ? QPP_BASE_RATE : CPP_BASE_RATE;
  const firstAdditionalRate = isQuebec
    ? QPP_FIRST_ADDITIONAL_RATE
    : CPP_FIRST_ADDITIONAL_RATE;
  const tier1Max = isQuebec ? QPP_MAX_EMPLOYEE_TIER1 : CPP_MAX_EMPLOYEE_TIER1;

  const base = pensionable * baseRate;
  const firstAdditional = pensionable * firstAdditionalRate;
  const tier1Uncapped = base + firstAdditional;
  const tier1Scale =
    tier1Uncapped > tier1Max ? tier1Max / tier1Uncapped : 1;

  const scaledBase = base * tier1Scale;
  const scaledFirstAdditional = firstAdditional * tier1Scale;
  const tier1 = scaledBase + scaledFirstAdditional;

  const tier2Pensionable = tier2PensionableEarnings(employmentIncome);
  const secondAdditional = Math.min(
    tier2Pensionable * CPP_SECOND_ADDITIONAL_RATE,
    CPP_MAX_EMPLOYEE_TIER2,
  );

  return {
    base: scaledBase,
    firstAdditional: scaledFirstAdditional,
    secondAdditional,
    tier1,
    tier2: secondAdditional,
    total: tier1 + secondAdditional,
  };
}

export interface SelfEmployedPensionTaxBreakdown {
  /** Cash contribution paid by self-employed individual. */
  totalContribution: number;
  /** Base amount eligible for non-refundable credit. */
  baseCreditAmount: number;
  /** Enhanced + employer base — deductible from taxable income. */
  enhancedDeduction: number;
}

export function calculateSelfEmployedPension(
  selfEmploymentIncome: number,
  employmentIncome: number,
  isQuebec: boolean,
): SelfEmployedPensionTaxBreakdown {
  const baseRate = isQuebec ? QPP_BASE_RATE : CPP_BASE_RATE;
  const firstAdditionalRate = isQuebec
    ? QPP_FIRST_ADDITIONAL_RATE
    : CPP_FIRST_ADDITIONAL_RATE;

  const combinedTier1Room = Math.max(
    0,
    PENSION_YMCE - tier1PensionableEarnings(employmentIncome),
  );
  const selfTier1 = Math.min(
    Math.max(0, selfEmploymentIncome),
    combinedTier1Room,
  );

  const baseCreditAmount = selfTier1 * baseRate;
  const tier1BothPortions = selfTier1 * (baseRate + firstAdditionalRate) * 2;
  const enhancedDeductionTier1 =
    selfTier1 * baseRate + selfTier1 * firstAdditionalRate * 2;

  const combinedTier2Room = Math.max(
    0,
    PENSION_YAMCE - tier2PensionableEarnings(employmentIncome),
  );
  const selfTier2 = Math.min(
    Math.max(0, selfEmploymentIncome - selfTier1),
    combinedTier2Room,
  );
  const tier2BothPortions = selfTier2 * CPP_SECOND_ADDITIONAL_RATE * 2;
  const enhancedDeductionTier2 = selfTier2 * CPP_SECOND_ADDITIONAL_RATE * 2;

  return {
    totalContribution: tier1BothPortions + tier2BothPortions,
    baseCreditAmount,
    enhancedDeduction: enhancedDeductionTier1 + enhancedDeductionTier2,
  };
}

export function calculateEi(employmentIncome: number, isQuebec: boolean): number {
  const rate = isQuebec ? EI_RATE_QC : EI_RATE;
  const maxPremium = isQuebec ? EI_MAX_PREMIUM_QC : EI_MAX_PREMIUM;
  const insurable = Math.min(Math.max(0, employmentIncome), EI_MAX_INSURABLE);
  return Math.min(insurable * rate, maxPremium);
}

export function calculateQpip(employmentIncome: number): number {
  const insurable = Math.min(Math.max(0, employmentIncome), QPIP_MAX_INSURABLE);
  return Math.min(insurable * QPIP_RATE, QPIP_MAX_PREMIUM);
}

/** Legacy alias — tier-1 employee pension cash total. */
export function employeePensionTier1(
  employmentIncome: number,
  isQuebec: boolean,
): number {
  return calculateEmployeePension(employmentIncome, isQuebec).tier1;
}
