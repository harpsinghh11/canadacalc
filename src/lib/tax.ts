export interface TaxBracket {
  /** Upper bound of bracket (Infinity for top bracket) */
  max: number;
  /** Marginal rate as decimal, e.g. 0.15 for 15% */
  rate: number;
}

/**
 * 2025 Federal income tax brackets (CRA).
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html
 *
 * | Bracket (taxable income)     | Rate  |
 * |------------------------------|-------|
 * | Up to $57,375                | 15%   |
 * | $57,375.01 – $114,750        | 20.5% |
 * | $114,750.01 – $158,519       | 26%   |
 * | $158,519.01 – $220,000       | 29%   |
 * | Over $220,000                | 33%   |
 */
export const FEDERAL_BRACKETS_2025: TaxBracket[] = [
  { max: 57375, rate: 0.15 },
  { max: 114750, rate: 0.205 },
  { max: 158519, rate: 0.26 },
  { max: 220000, rate: 0.29 },
  { max: Infinity, rate: 0.33 },
];

/** 2025 Federal Basic Personal Amount (BPA) */
export const FEDERAL_BPA_2025 = 16129;

/** Federal dividend gross-up rate for eligible dividends (2025) */
export const FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP = 0.38;

/** Federal dividend tax credit rate on grossed-up eligible dividends (2025) */
export const FEDERAL_ELIGIBLE_DTC_RATE = 0.150198;

/**
 * 2025 Provincial tax brackets (CRA payroll tables / provincial budgets).
 * Update annually from each province's published rates.
 */
export const PROVINCIAL_BRACKETS_2025: Record<string, TaxBracket[]> = {
  // Alberta — 2025 (annualized July–Dec prorated rates)
  AB: [
    { max: 60000, rate: 0.08 },
    { max: 151234, rate: 0.1 },
    { max: 181481, rate: 0.12 },
    { max: 241974, rate: 0.13 },
    { max: 362961, rate: 0.14 },
    { max: Infinity, rate: 0.15 },
  ],
  // British Columbia — 2025
  BC: [
    { max: 49279, rate: 0.0506 },
    { max: 98560, rate: 0.077 },
    { max: 113158, rate: 0.105 },
    { max: 137407, rate: 0.1229 },
    { max: 186306, rate: 0.147 },
    { max: 259829, rate: 0.168 },
    { max: Infinity, rate: 0.205 },
  ],
  // Manitoba — 2025
  MB: [
    { max: 47564, rate: 0.108 },
    { max: 100200, rate: 0.1275 },
    { max: Infinity, rate: 0.174 },
  ],
  // New Brunswick — 2025
  NB: [
    { max: 51306, rate: 0.094 },
    { max: 102614, rate: 0.14 },
    { max: 190060, rate: 0.16 },
    { max: Infinity, rate: 0.195 },
  ],
  // Newfoundland and Labrador — 2025
  NL: [
    { max: 44192, rate: 0.087 },
    { max: 88382, rate: 0.145 },
    { max: 157792, rate: 0.158 },
    { max: 220910, rate: 0.178 },
    { max: 282214, rate: 0.198 },
    { max: 564429, rate: 0.208 },
    { max: 1128858, rate: 0.213 },
    { max: Infinity, rate: 0.218 },
  ],
  // Nova Scotia — 2025
  NS: [
    { max: 30507, rate: 0.0879 },
    { max: 61015, rate: 0.1495 },
    { max: 95883, rate: 0.1667 },
    { max: 154650, rate: 0.175 },
    { max: Infinity, rate: 0.21 },
  ],
  // Ontario — 2025
  ON: [
    { max: 52886, rate: 0.0505 },
    { max: 105775, rate: 0.0915 },
    { max: 150000, rate: 0.1116 },
    { max: 220000, rate: 0.1216 },
    { max: Infinity, rate: 0.1316 },
  ],
  // Prince Edward Island — 2025
  PE: [
    { max: 33328, rate: 0.095 },
    { max: 64656, rate: 0.1347 },
    { max: 105000, rate: 0.166 },
    { max: 140000, rate: 0.1762 },
    { max: Infinity, rate: 0.19 },
  ],
  // Quebec — 2025 (Revenu Québec)
  QC: [
    { max: 53255, rate: 0.14 },
    { max: 106495, rate: 0.19 },
    { max: 129590, rate: 0.24 },
    { max: Infinity, rate: 0.2575 },
  ],
  // Saskatchewan — 2025
  SK: [
    { max: 53463, rate: 0.105 },
    { max: 152750, rate: 0.125 },
    { max: Infinity, rate: 0.145 },
  ],
};

/**
 * Provincial eligible dividend tax credit rates (2025, approximate).
 * Applied to grossed-up dividend amount.
 */
export const PROVINCIAL_ELIGIBLE_DTC_RATES: Record<string, number> = {
  AB: 0.0812,
  BC: 0.12,
  MB: 0.08,
  NB: 0.14,
  NL: 0.113,
  NS: 0.08985,
  ON: 0.10,
  PE: 0.105,
  QC: 0.119145,
  SK: 0.11,
};

/**
 * 2025 CPP contribution parameters (CRA).
 * Employee rate: 5.95% on earnings between $3,500 and $71,300 (YMPE).
 */
export const CPP_RATE_2025 = 0.0595;
export const CPP_EXEMPTION_2025 = 3500;
export const CPP_MAX_PENSIONABLE_2025 = 71300;

/**
 * 2025 EI premium rates (CRA).
 * Standard: 1.66% on insurable earnings up to $65,700.
 * Quebec (QPIP): 1.32% on earnings up to $65,700.
 */
export const EI_RATE_2025 = 0.0166;
export const EI_RATE_QC_2025 = 0.0132;
export const EI_MAX_INSURABLE_2025 = 65700;

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
  cpp: number;
  cppSelfEmployed: number;
  ei: number;
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
}

export function calculateBracketTax(
  income: number,
  brackets: TaxBracket[],
): number {
  if (income <= 0) return 0;

  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (income <= previousMax) break;
    const taxableInBracket = Math.min(income, bracket.max) - previousMax;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
    previousMax = bracket.max;
  }

  return tax;
}

export function getMarginalRateForIncome(
  taxableIncome: number,
  province: string,
): number {
  const federalBrackets = FEDERAL_BRACKETS_2025;
  const provincialBrackets = PROVINCIAL_BRACKETS_2025[province] ?? [];

  let federalRate = 0;
  let provincialRate = 0;

  for (const bracket of federalBrackets) {
    if (taxableIncome <= bracket.max) {
      federalRate = bracket.rate;
      break;
    }
  }

  for (const bracket of provincialBrackets) {
    if (taxableIncome <= bracket.max) {
      provincialRate = bracket.rate;
      break;
    }
  }

  return federalRate + provincialRate;
}

function buildTaxableIncome(input: TaxInput): {
  taxableIncome: number;
  grossedUpDividends: number;
  totalDeductions: number;
} {
  const totalIncomeForDeductionCap =
    input.employmentIncome +
    input.selfEmploymentIncome +
    input.rentalIncome +
    input.interestIncome +
    input.otherIncome;

  const rrspDeduction = Math.min(
    input.rrspContribution,
    totalIncomeForDeductionCap,
  );
  const fhsaDeduction = Math.min(
    input.fhsaContribution,
    totalIncomeForDeductionCap,
  );
  const taxableCapitalGains = input.capitalGains * 0.5;
  const grossedUpDividends =
    input.eligibleDividends * (1 + FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP);

  const taxableIncome = Math.max(
    0,
    input.employmentIncome +
      input.selfEmploymentIncome +
      input.rentalIncome +
      input.interestIncome +
      input.otherIncome +
      taxableCapitalGains +
      grossedUpDividends -
      rrspDeduction -
      fhsaDeduction,
  );

  return {
    taxableIncome,
    grossedUpDividends,
    totalDeductions: rrspDeduction + fhsaDeduction,
  };
}

export function calculateIncomeTaxOnly(
  input: TaxInput,
): IncomeTaxOnlyResult {
  const { taxableIncome, grossedUpDividends } = buildTaxableIncome(input);

  let federalTax = calculateBracketTax(
    taxableIncome,
    FEDERAL_BRACKETS_2025,
  );
  federalTax -= FEDERAL_BPA_2025 * 0.15;
  federalTax -= grossedUpDividends * FEDERAL_ELIGIBLE_DTC_RATE;
  federalTax = Math.max(0, federalTax);

  const provincialBrackets = PROVINCIAL_BRACKETS_2025[input.province] ?? [];
  let provincialTax = calculateBracketTax(taxableIncome, provincialBrackets);
  const provincialDtcRate =
    PROVINCIAL_ELIGIBLE_DTC_RATES[input.province] ?? 0;
  provincialTax -= grossedUpDividends * provincialDtcRate;
  provincialTax = Math.max(0, provincialTax);

  return {
    federalTax,
    provincialTax,
    totalIncomeTax: federalTax + provincialTax,
    taxableIncome,
  };
}

export function getMarginalRate(input: TaxInput): number {
  const { taxableIncome } = buildTaxableIncome(input);
  return getMarginalRateForIncome(taxableIncome, input.province) * 100;
}

function calculateCppEi(input: TaxInput): {
  cppEmployee: number;
  cppSelfEmployed: number;
  ei: number;
} {
  const employmentPensionable = Math.min(
    Math.max(0, input.employmentIncome - CPP_EXEMPTION_2025),
    CPP_MAX_PENSIONABLE_2025 - CPP_EXEMPTION_2025,
  );
  const cppEmployee = employmentPensionable * CPP_RATE_2025;

  // Self-employed CPP: 11.9% (both employer + employee portions at 5.95% each)
  // on net self-employment income, combined with employment CPP up to YMPE.
  const selfEmployPensionable = Math.max(0, input.selfEmploymentIncome);
  const maxCombinedPensionable =
    CPP_MAX_PENSIONABLE_2025 - CPP_EXEMPTION_2025;
  const cappedSelfEmployPensionable = Math.max(
    0,
    Math.min(
      selfEmployPensionable,
      maxCombinedPensionable - employmentPensionable,
    ),
  );
  const cppSelfEmployed = cappedSelfEmployPensionable * CPP_RATE_2025 * 2;

  const eiRate =
    input.province === "QC" ? EI_RATE_QC_2025 : EI_RATE_2025;
  const insurableEarnings = Math.min(
    input.employmentIncome,
    EI_MAX_INSURABLE_2025,
  );
  const ei = insurableEarnings * eiRate;

  return { cppEmployee, cppSelfEmployed, ei };
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
  const base = calculateIncomeTaxOnly(input);
  const { cppEmployee, cppSelfEmployed, ei } = calculateCppEi(input);

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
    const withoutTax = calculateIncomeTaxOnly(without);

    const federalDelta = base.federalTax - withoutTax.federalTax;
    const provincialDelta = base.provincialTax - withoutTax.provincialTax;

    let cppEi = 0;
    if (key === "employmentIncome") {
      cppEi = cppEmployee + ei;
    } else if (key === "selfEmploymentIncome") {
      cppEi = cppSelfEmployed;
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
      key === "capitalGains"
        ? amount
        : key === "eligibleDividends"
          ? amount
          : displayAmount;

    rows.push({
      label,
      amount: grossForRow,
      federalTax: federalDelta,
      provincialTax: provincialDelta,
      cppEi,
      netAfterTax:
        grossForRow - federalDelta - provincialDelta - cppEi,
    });
  }

  return rows;
}

export function calculateTax(input: TaxInput): TaxResult {
  const { taxableIncome } = buildTaxableIncome(input);
  const { federalTax, provincialTax } = calculateIncomeTaxOnly(input);
  const { cppEmployee, cppSelfEmployed, ei } = calculateCppEi(input);

  const cpp = cppEmployee + cppSelfEmployed;
  const totalDeductions =
    federalTax + provincialTax + cpp + ei;
  const rrspDeduction = Math.min(
    input.rrspContribution,
    input.employmentIncome +
      input.selfEmploymentIncome +
      input.rentalIncome +
      input.interestIncome +
      input.otherIncome,
  );
  const fhsaDeduction = Math.min(
    input.fhsaContribution,
    input.employmentIncome +
      input.selfEmploymentIncome +
      input.rentalIncome +
      input.interestIncome +
      input.otherIncome,
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
    grossIncome -
    totalDeductions -
    rrspDeduction -
    fhsaDeduction;

  const effectiveTaxRate =
    grossIncome > 0 ? (totalDeductions / grossIncome) * 100 : 0;

  const marginalTaxRate =
    getMarginalRateForIncome(taxableIncome, input.province) * 100;

  return {
    federalTax,
    provincialTax,
    cpp: cppEmployee,
    cppSelfEmployed,
    ei,
    totalTax: federalTax + provincialTax,
    effectiveTaxRate,
    marginalTaxRate,
    afterTaxIncome,
    taxableIncome,
    breakdown: buildBreakdown(input),
  };
}
