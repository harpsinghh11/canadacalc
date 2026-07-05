/** 2025 annual TFSA contribution limit (CRA) — historical */
export const TFSA_ANNUAL_LIMIT_2025 = 7000;

/** Cumulative TFSA room since 2009 through 2025 (CRA) — historical */
export const TFSA_CUMULATIVE_ROOM_2025 = 102000;

/** Current TFSA planning year (CRA) */
export const TFSA_CURRENT_YEAR = 2026;

/** 2026 annual TFSA contribution limit (CRA) */
export const TFSA_ANNUAL_LIMIT_2026 = 7000;

/** Maximum sum of annual TFSA dollar limits from 2009 through 2026 — reference total, not personalized room */
export const TFSA_CUMULATIVE_ROOM_2026 = 109000;

/**
 * Cumulative TFSA contribution room by year (CRA annual limits).
 * Update each January when CRA announces the new limit.
 */
export const TFSA_LIMITS_BY_YEAR: Record<number, number> = {
  2009: 5000,
  2010: 5000,
  2011: 5000,
  2012: 5000,
  2013: 5500,
  2014: 5500,
  2015: 10000,
  2016: 5500,
  2017: 5500,
  2018: 5500,
  2019: 6000,
  2020: 6000,
  2021: 6000,
  2022: 6000,
  2023: 6500,
  2024: 7000,
  2025: 7000,
  2026: 7000,
};

export function getTfsaEligibilityStartYear(
  currentAge: number,
  currentYear = new Date().getFullYear(),
): number {
  const birthYear = currentYear - currentAge;
  const turn18Year = birthYear + 18;
  return Math.max(2009, turn18Year);
}

/** Sum of annual CRA dollar limits from eligibility start year through upToYear — reference estimate only */
export function getCumulativeTfsaRoom(
  currentAge?: number,
  upToYear = TFSA_CURRENT_YEAR,
): number {
  const currentYear = new Date().getFullYear();
  const startYear =
    currentAge !== undefined
      ? getTfsaEligibilityStartYear(currentAge, currentYear)
      : 2009;

  return Object.entries(TFSA_LIMITS_BY_YEAR)
    .filter(([year]) => {
      const y = Number(year);
      return y >= startYear && y <= upToYear;
    })
    .reduce((sum, [, limit]) => sum + limit, 0);
}

export interface TfsaYearRow {
  age: number;
  year: number;
  contribution: number;
  growth: number;
  balance: number;
  cumulativeContributions: number;
}

export interface TfsaResult {
  projectedBalance: number;
  totalContributions: number;
  totalGrowth: number;
  cumulativeRoom: number;
  annualContribution: number;
  yearlyData: TfsaYearRow[];
}

export function calculateTfsa(
  currentAge: number,
  currentBalance: number,
  annualContribution: number,
  returnRate: number,
  targetAge = 65,
): TfsaResult {
  const currentYear = new Date().getFullYear();
  const eligibilityStart = getTfsaEligibilityStartYear(currentAge, currentYear);
  const yearsToProject = Math.max(0, Math.min(targetAge, 120) - currentAge);
  const rate = returnRate / 100;

  let balance = currentBalance;
  let cumulativeContributions = 0;
  const yearlyData: TfsaYearRow[] = [];

  for (let i = 0; i <= yearsToProject; i++) {
    const age = currentAge + i;
    const year = currentYear + i;
    const yearLimit =
      year >= eligibilityStart
        ? (TFSA_LIMITS_BY_YEAR[year] ?? TFSA_ANNUAL_LIMIT_2026)
        : 0;
    const contribution =
      i === 0 || age < 18 ? 0 : Math.min(annualContribution, yearLimit);

    const openingBalance = balance;
    const growth = openingBalance * rate;
    balance = openingBalance + growth + contribution;
    cumulativeContributions += contribution;

    yearlyData.push({
      age,
      year,
      contribution,
      growth,
      balance,
      cumulativeContributions,
    });
  }

  const lastRow = yearlyData[yearlyData.length - 1];

  return {
    projectedBalance: lastRow?.balance ?? currentBalance,
    totalContributions: cumulativeContributions,
    totalGrowth:
      (lastRow?.balance ?? currentBalance) -
      currentBalance -
      cumulativeContributions,
    cumulativeRoom: getCumulativeTfsaRoom(currentAge),
    annualContribution,
    yearlyData,
  };
}
