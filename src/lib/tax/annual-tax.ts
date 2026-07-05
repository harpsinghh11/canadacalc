import { CAPITAL_GAINS_INCLUSION_RATE } from "./constants";
import { enhancedPensionDeduction } from "./contribution-tax";
import {
  calculateEi,
  calculateEmployeePension,
  calculateQpip,
  calculateSelfEmployedPension,
} from "./contributions";
import { calculateFederalIncomeTax } from "./federal";
import { grossUpEligibleDividends } from "./dividends";
import {
  calculateProvincialIncomeTax,
  getCombinedMarginalRate,
} from "./provincial";
import type {
  IncomeBreakdownRow,
  IncomeTaxOnlyResult,
  PensionContributionDetail,
  TaxableIncomeBreakdown,
  TaxCalculationDetail,
  TaxInput,
  TaxResult,
} from "./types";

function resolveContributions(input: TaxInput) {
  const isQuebec = input.province === "QC";
  const pension = calculateEmployeePension(input.employmentIncome, isQuebec);
  const selfEmployed = calculateSelfEmployedPension(
    input.selfEmploymentIncome,
    input.employmentIncome,
    isQuebec,
  );
  const ei = calculateEi(input.employmentIncome, isQuebec);
  const qpip = isQuebec ? calculateQpip(input.employmentIncome) : 0;
  const enhancedDeduction = enhancedPensionDeduction(
    pension,
    selfEmployed.enhancedDeduction,
  );

  const pensionDetail: PensionContributionDetail = {
    base: pension.base,
    firstAdditional: pension.firstAdditional,
    secondAdditional: pension.secondAdditional,
    tier1Cash: pension.tier1,
    tier2Cash: pension.tier2,
  };

  return {
    pension,
    pensionDetail,
    selfEmployed,
    ei,
    qpip,
    enhancedDeduction,
  };
}

export function buildTaxableIncome(
  input: TaxInput,
  enhancedPensionDeductionAmount = 0,
): TaxableIncomeBreakdown {
  const earnedForDeductionCap =
    input.employmentIncome +
    input.selfEmploymentIncome +
    input.rentalIncome +
    input.interestIncome +
    input.otherIncome;

  const rrspDeduction = Math.min(
    input.rrspContribution,
    earnedForDeductionCap,
  );
  const fhsaDeduction = Math.min(
    input.fhsaContribution,
    earnedForDeductionCap,
  );

  const taxableCapitalGains = input.capitalGains * CAPITAL_GAINS_INCLUSION_RATE;
  const grossedUpDividends = grossUpEligibleDividends(input.eligibleDividends);

  const netIncome =
    input.employmentIncome +
    input.selfEmploymentIncome +
    input.rentalIncome +
    input.interestIncome +
    input.otherIncome +
    taxableCapitalGains +
    grossedUpDividends;

  const taxableIncomeBeforeEnhancedDeduction = Math.max(
    0,
    netIncome - rrspDeduction - fhsaDeduction,
  );

  const taxableIncome = Math.max(
    0,
    taxableIncomeBeforeEnhancedDeduction - enhancedPensionDeductionAmount,
  );

  return {
    taxableIncomeBeforeEnhancedDeduction,
    enhancedPensionDeduction: enhancedPensionDeductionAmount,
    taxableIncome,
    grossedUpDividends,
    netIncome,
  };
}

function calculateTaxComponents(input: TaxInput) {
  const contributions = resolveContributions(input);
  const income = buildTaxableIncome(input, contributions.enhancedDeduction);

  const federal = calculateFederalIncomeTax({
    taxableIncome: income.taxableIncome,
    netIncome: income.netIncome,
    grossedUpEligibleDividends: income.grossedUpDividends,
    employmentIncome: input.employmentIncome,
    province: input.province,
    pension: contributions.pension,
    eiPremium: contributions.ei,
    qpipPremium: contributions.qpip,
    selfEmployedBaseCredit: contributions.selfEmployed.baseCreditAmount,
  });

  const provincial = calculateProvincialIncomeTax({
    province: input.province,
    taxableIncome: income.taxableIncome,
    netIncome: income.netIncome,
    grossedUpEligibleDividends: income.grossedUpDividends,
    pension: contributions.pension,
    eiPremium: contributions.ei,
    qpipPremium: contributions.qpip,
    selfEmployedBaseCredit: contributions.selfEmployed.baseCreditAmount,
  });

  const calculationDetail: TaxCalculationDetail = {
    taxableIncomeBeforeEnhancedDeduction:
      income.taxableIncomeBeforeEnhancedDeduction,
    enhancedPensionDeduction: income.enhancedPensionDeduction,
    taxableIncome: income.taxableIncome,
    federalTaxBeforeCredits: federal.taxBeforeCredits,
    federalNonRefundableCredits: federal.credits.total,
    federalTopUpCredit: federal.credits.topUp,
    federalBasicTax: federal.basicFederalTax,
    quebecAbatement: federal.quebecAbatement,
    provincialTaxBeforeCredits: provincial.taxBeforeCredits,
    provincialNonRefundableCredits: provincial.credits.total,
    pensionContributions: contributions.pensionDetail,
    eiPremium: contributions.ei,
    qpipPremium: contributions.qpip,
  };

  return {
    ...contributions,
    income,
    federalTax: federal.taxAfterCredits,
    provincialTax: provincial.taxAfterCredits,
    calculationDetail,
  };
}

export function calculateIncomeTaxOnly(
  input: TaxInput,
): IncomeTaxOnlyResult {
  const result = calculateTaxComponents(input);
  return {
    federalTax: result.federalTax,
    provincialTax: result.provincialTax,
    totalIncomeTax: result.federalTax + result.provincialTax,
    taxableIncome: result.income.taxableIncome,
    enhancedPensionDeduction: result.income.enhancedPensionDeduction,
  };
}

export function getMarginalRate(input: TaxInput): number {
  const { enhancedDeduction } = resolveContributions(input);
  const { taxableIncome } = buildTaxableIncome(input, enhancedDeduction);
  return getCombinedMarginalRate(taxableIncome, input.province) * 100;
}

export function getMarginalRateForIncome(
  taxableIncome: number,
  province: string,
): number {
  return getCombinedMarginalRate(taxableIncome, province);
}

type BreakdownKey =
  | "employmentIncome"
  | "selfEmploymentIncome"
  | "rentalIncome"
  | "interestIncome"
  | "otherIncome"
  | "capitalGains"
  | "eligibleDividends"
  | "rrspContribution"
  | "fhsaContribution";

const BREAKDOWN_LABELS: Record<BreakdownKey, string> = {
  employmentIncome: "Employment Income",
  selfEmploymentIncome: "Self-Employment / Business",
  rentalIncome: "Rental Income",
  interestIncome: "Interest Income",
  otherIncome: "Other Income",
  capitalGains: "Capital Gains",
  eligibleDividends: "Eligible Dividends",
  rrspContribution: "RRSP Contribution",
  fhsaContribution: "FHSA Contribution",
};

function buildBreakdown(input: TaxInput): IncomeBreakdownRow[] {
  const rows: IncomeBreakdownRow[] = [];
  const base = calculateTaxComponents(input);

  const keys: BreakdownKey[] = [
    "employmentIncome",
    "selfEmploymentIncome",
    "rentalIncome",
    "interestIncome",
    "otherIncome",
    "capitalGains",
    "eligibleDividends",
    "rrspContribution",
    "fhsaContribution",
  ];

  for (const key of keys) {
    const amount = input[key] as number;
    if (key !== "otherIncome" && amount === 0) continue;
    if (key === "otherIncome" && amount === 0) continue;

    const without: TaxInput = { ...input, [key]: 0 };
    const withoutTax = calculateTaxComponents(without);

    const federalDelta = base.federalTax - withoutTax.federalTax;
    const provincialDelta = base.provincialTax - withoutTax.provincialTax;

    let cppEi = 0;
    if (key === "employmentIncome") {
      cppEi =
        base.pension.tier1 +
        base.pension.tier2 +
        base.ei +
        base.qpip;
    } else if (key === "selfEmploymentIncome") {
      cppEi = base.selfEmployed.totalContribution;
    }

    const displayAmount =
      key === "rrspContribution" || key === "fhsaContribution"
        ? -amount
        : amount;

    const label =
      key === "otherIncome" && input.otherIncomeLabel.trim()
        ? input.otherIncomeLabel.trim()
        : BREAKDOWN_LABELS[key];

    const grossForRow =
      key === "capitalGains" || key === "eligibleDividends"
        ? amount
        : displayAmount;

    rows.push({
      label,
      amount: grossForRow,
      federalTax: federalDelta,
      provincialTax: provincialDelta,
      cppEi,
      netAfterTax: grossForRow - federalDelta - provincialDelta - cppEi,
    });
  }

  return rows;
}

export function calculateTax(input: TaxInput): TaxResult {
  const result = calculateTaxComponents(input);

  const pensionCash =
    result.pension.tier1 +
    result.pension.tier2 +
    result.selfEmployed.totalContribution;
  const payrollCash = pensionCash + result.ei + result.qpip;
  const totalDeductions =
    result.federalTax + result.provincialTax + payrollCash;

  const earnedForDeductionCap =
    input.employmentIncome +
    input.selfEmploymentIncome +
    input.rentalIncome +
    input.interestIncome +
    input.otherIncome;

  const rrspDeduction = Math.min(
    input.rrspContribution,
    earnedForDeductionCap,
  );
  const fhsaDeduction = Math.min(
    input.fhsaContribution,
    earnedForDeductionCap,
  );

  const grossIncome =
    input.employmentIncome +
    input.selfEmploymentIncome +
    input.rentalIncome +
    input.interestIncome +
    input.otherIncome +
    input.capitalGains +
    input.eligibleDividends;

  const afterTaxIncome =
    grossIncome - totalDeductions - rrspDeduction - fhsaDeduction;

  const effectiveTaxRate =
    grossIncome > 0 ? (totalDeductions / grossIncome) * 100 : 0;

  const marginalTaxRate =
    getCombinedMarginalRate(
      result.income.taxableIncome,
      input.province,
    ) * 100;

  return {
    federalTax: result.federalTax,
    provincialTax: result.provincialTax,
    cpp: result.pension.tier1,
    cpp2: result.pension.tier2,
    cppSelfEmployed: result.selfEmployed.totalContribution,
    ei: result.ei,
    qpip: result.qpip,
    pensionDetail: result.pensionDetail,
    calculationDetail: result.calculationDetail,
    totalTax: result.federalTax + result.provincialTax,
    effectiveTaxRate,
    marginalTaxRate,
    afterTaxIncome,
    taxableIncome: result.income.taxableIncome,
    breakdown: buildBreakdown(input),
  };
}

export function calculateEmploymentTaxExample(
  province: string,
  employmentIncome: number,
): TaxResult {
  return calculateTax({
    province,
    employmentIncome,
    selfEmploymentIncome: 0,
    rentalIncome: 0,
    interestIncome: 0,
    otherIncome: 0,
    otherIncomeLabel: "",
    rrspContribution: 0,
    fhsaContribution: 0,
    capitalGains: 0,
    eligibleDividends: 0,
  });
}
