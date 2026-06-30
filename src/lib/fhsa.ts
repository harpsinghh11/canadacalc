import {
  getMarginalRate,
  type TaxInput,
  calculateIncomeTaxOnly,
} from "@/lib/tax";

/** 2025 annual FHSA contribution limit (CRA) */
export const FHSA_ANNUAL_LIMIT = 8000;

/** Maximum FHSA contribution in a single year with carryforward (CRA) */
export const FHSA_MAX_ANNUAL_WITH_CARRYFORWARD = 16000;

/** Lifetime FHSA contribution limit (CRA) */
export const FHSA_LIFETIME_LIMIT = 40000;

/** Maximum years an FHSA can remain open (CRA) */
export const FHSA_MAX_YEARS = 15;

/** FHSA must be closed by this age (CRA) */
export const FHSA_MAX_AGE = 71;

export interface FhsaYearRow {
  age: number;
  year: number;
  contribution: number;
  taxRefund: number;
  growth: number;
  balance: number;
  lifetimeContributed: number;
  carryForwardRoom: number;
}

export interface FhsaResult {
  projectedBalance: number;
  totalContributions: number;
  totalTaxRefunds: number;
  totalGrowth: number;
  lifetimeLimitWarning: boolean;
  accountExpiryWarning: string | null;
  annualContribution: number;
  yearlyData: FhsaYearRow[];
}

export function calculateFhsa(
  currentAge: number,
  province: string,
  annualContribution: number,
  returnRate: number,
  targetPurchaseYear: number,
  employmentIncomeForMarginal = 75000,
): FhsaResult {
  const currentYear = new Date().getFullYear();
  const yearsToProject = Math.max(0, targetPurchaseYear - currentYear);
  const rate = returnRate / 100;

  const accountExpiryYear = Math.min(
    currentYear + FHSA_MAX_YEARS,
    currentYear + (FHSA_MAX_AGE - currentAge),
  );

  let balance = 0;
  let lifetimeContributed = 0;
  let carryForwardRoom = 0;
  let totalTaxRefunds = 0;
  const yearlyData: FhsaYearRow[] = [];
  let lifetimeLimitWarning = false;

  const marginalInput: TaxInput = {
    province,
    employmentIncome: employmentIncomeForMarginal,
    selfEmploymentIncome: 0,
    rentalIncome: 0,
    interestIncome: 0,
    otherIncome: 0,
    otherIncomeLabel: "",
    rrspContribution: 0,
    fhsaContribution: 0,
    capitalGains: 0,
    eligibleDividends: 0,
  };
  const marginalRate = getMarginalRate(marginalInput) / 100;

  for (let i = 0; i <= yearsToProject; i++) {
    const age = currentAge + i;
    const year = currentYear + i;

    if (year > accountExpiryYear) break;

    const availableRoom = Math.min(
      FHSA_MAX_ANNUAL_WITH_CARRYFORWARD,
      FHSA_ANNUAL_LIMIT + carryForwardRoom,
      FHSA_LIFETIME_LIMIT - lifetimeContributed,
    );

    const contribution =
      i === 0 ? 0 : Math.min(annualContribution, Math.max(0, availableRoom));

    if (lifetimeContributed + contribution >= FHSA_LIFETIME_LIMIT) {
      lifetimeLimitWarning = true;
    }

    const usedFromNewRoom = Math.min(contribution, FHSA_ANNUAL_LIMIT);
    carryForwardRoom = FHSA_ANNUAL_LIMIT - usedFromNewRoom;

    const taxRefund = contribution * marginalRate;
    totalTaxRefunds += taxRefund;

    const openingBalance = balance;
    const growth = openingBalance * rate;
    balance = openingBalance + growth + contribution;
    lifetimeContributed += contribution;

    yearlyData.push({
      age,
      year,
      contribution,
      taxRefund,
      growth,
      balance,
      lifetimeContributed,
      carryForwardRoom,
    });
  }

  const lastRow = yearlyData[yearlyData.length - 1];
  const targetRow =
    yearlyData.find((r) => r.year === targetPurchaseYear) ?? lastRow;

  let accountExpiryWarning: string | null = null;
  if (targetPurchaseYear > accountExpiryYear) {
    accountExpiryWarning = `Your FHSA expires in ${accountExpiryYear} (15-year limit or age ${FHSA_MAX_AGE}, whichever is first).`;
  }
  if (lifetimeContributed >= FHSA_LIFETIME_LIMIT) {
    lifetimeLimitWarning = true;
  }

  return {
    projectedBalance: targetRow?.balance ?? 0,
    totalContributions: lifetimeContributed,
    totalTaxRefunds,
    totalGrowth:
      (targetRow?.balance ?? 0) - lifetimeContributed,
    lifetimeLimitWarning,
    accountExpiryWarning,
    annualContribution,
    yearlyData,
  };
}

/** Tax refund for a single FHSA contribution at the user's marginal rate */
export function estimateFhsaTaxRefund(
  contribution: number,
  taxInput: TaxInput,
): number {
  if (contribution <= 0) return 0;
  const base = calculateIncomeTaxOnly(taxInput);
  const withFhsa = calculateIncomeTaxOnly({
    ...taxInput,
    fhsaContribution: taxInput.fhsaContribution + contribution,
  });
  return Math.max(0, base.totalIncomeTax - withFhsa.totalIncomeTax);
}
