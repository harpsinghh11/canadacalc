/**
 * Annual 2026 income tax estimator — single source of truth.
 * @see ./types.ts for product model documentation.
 */

export { TAX_YEAR, TAX_MODEL } from "./types";
export type {
  TaxBracket,
  TaxInput,
  TaxResult,
  IncomeBreakdownRow,
  IncomeTaxOnlyResult,
} from "./types";

export {
  CAPITAL_GAINS_INCLUSION_RATE,
  FEDERAL_BRACKETS,
  PROVINCIAL_BRACKETS,
  PENSION_YMPE,
  PENSION_YAMPE,
  CPP_TIER1_EMPLOYEE_RATE,
  CPP_SECOND_ADDITIONAL_RATE,
  QPP_TIER1_EMPLOYEE_RATE,
  EI_MAX_INSURABLE,
  QPIP_MAX_INSURABLE,
} from "./constants";

export { calculateBracketTax } from "./brackets";
export { federalBasicPersonalAmount } from "./federal";
export { calculateEmployeePension } from "./contributions";
export type { PensionContributionBreakdown } from "./contributions";
export {
  federalCanadaEmploymentAmount,
  federalTopUpTaxCredit,
} from "./contribution-tax";

export {
  buildTaxableIncome,
  calculateIncomeTaxOnly,
  calculateTax,
  calculateEmploymentTaxExample,
  getMarginalRate,
  getMarginalRateForIncome,
} from "./annual-tax";

// Legacy aliases
export const FEDERAL_LOWEST_RATE = 0.14;
export const FEDERAL_BPA_MAX = 16_452;
export const FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP = 0.38;
export const FEDERAL_ELIGIBLE_DTC_RATE = 0.150198;
export const PROVINCIAL_ELIGIBLE_DTC_RATES = {
  AB: 0.0812,
  BC: 0.12,
  MB: 0.08,
  NB: 0.14,
  NL: 0.063,
  NS: 0.0885,
  NT: 0.115,
  NU: 0.0551,
  ON: 0.1,
  PE: 0.105,
  QC: 0.117,
  SK: 0.11,
  YT: 0.1202,
};
export const QUEBEC_FEDERAL_ABATEMENT = 0.165;
export const CPP_RATE = 0.0595;
export const CPP_EXEMPTION = 3_500;
export const CPP_MAX_PENSIONABLE = 74_600;
export const QPP_RATE = 0.063;
export const EI_RATE = 0.0163;
export const EI_RATE_QC = 0.013;
