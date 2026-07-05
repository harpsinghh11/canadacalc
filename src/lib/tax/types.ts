/**
 * CanadaCalc /tax product model:
 * ANNUAL 2026 INCOME TAX ESTIMATOR — not payroll withholding.
 * Estimates annual income tax, pension premiums, and EI/QPIP on user-entered
 * annual amounts. Payroll-period proration (T4127 Option 1 July catch-up rates)
 * is intentionally excluded.
 */

export const TAX_YEAR = 2026;

export const TAX_MODEL = "annual-income-tax-estimator" as const;

export interface TaxBracket {
  max: number;
  rate: number;
}

export interface TaxInput {
  province: string;
  employmentIncome: number;
  selfEmploymentIncome: number;
  rentalIncome: number;
  interestIncome: number;
  otherIncome: number;
  otherIncomeLabel: string;
  rrspContribution: number;
  fhsaContribution: number;
  capitalGains: number;
  eligibleDividends: number;
}

export interface PensionContributionDetail {
  /** Base CPP/QPP — federal + provincial non-refundable credit. */
  base: number;
  /** First additional — taxable income deduction (line 22215). */
  firstAdditional: number;
  /** CPP2/QPP2 — taxable income deduction (line 22215). */
  secondAdditional: number;
  /** Tier-1 employee cash premium (base + first additional). */
  tier1Cash: number;
  /** Tier-2 employee cash premium. */
  tier2Cash: number;
}

export interface TaxCalculationDetail {
  taxableIncomeBeforeEnhancedDeduction: number;
  enhancedPensionDeduction: number;
  taxableIncome: number;
  federalTaxBeforeCredits: number;
  federalNonRefundableCredits: number;
  federalTopUpCredit: number;
  federalBasicTax: number;
  quebecAbatement: number;
  provincialTaxBeforeCredits: number;
  provincialNonRefundableCredits: number;
  pensionContributions: PensionContributionDetail;
  eiPremium: number;
  qpipPremium: number;
}

export interface IncomeBreakdownRow {
  label: string;
  amount: number;
  federalTax: number;
  provincialTax: number;
  cppEi: number;
  netAfterTax: number;
}

export interface TaxResult {
  federalTax: number;
  provincialTax: number;
  /** Tier-1 employee CPP/QPP cash premium (base + first additional). */
  cpp: number;
  /** Tier-2 employee CPP2/QPP2 cash premium. */
  cpp2: number;
  cppSelfEmployed: number;
  ei: number;
  /** Quebec Parental Insurance Plan — Quebec only. */
  qpip: number;
  pensionDetail: PensionContributionDetail;
  calculationDetail: TaxCalculationDetail;
  totalTax: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  afterTaxIncome: number;
  taxableIncome: number;
  breakdown: IncomeBreakdownRow[];
}

export interface IncomeTaxOnlyResult {
  federalTax: number;
  provincialTax: number;
  totalIncomeTax: number;
  taxableIncome: number;
  enhancedPensionDeduction: number;
}

export interface TaxableIncomeBreakdown {
  taxableIncomeBeforeEnhancedDeduction: number;
  enhancedPensionDeduction: number;
  taxableIncome: number;
  grossedUpDividends: number;
  /** Net income for credit phase-outs (before RRSP/FHSA cash deductions). */
  netIncome: number;
}
