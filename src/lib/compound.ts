export type CompoundingFrequency =
  | "daily"
  | "monthly"
  | "quarterly"
  | "annually";

const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export interface CompoundYearRow {
  year: number;
  balance: number;
  contributions: number;
  interest: number;
  periodContribution: number;
}

export interface CompoundResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  annualContribution: number;
  yearlyData: CompoundYearRow[];
}

export function calculateCompoundInterest(
  principal: number,
  annualContribution: number,
  interestRate: number,
  compoundingFrequency: CompoundingFrequency,
  years: number,
): CompoundResult {
  const n = PERIODS_PER_YEAR[compoundingFrequency];
  const r = interestRate / 100;
  const periodicRate = r / n;
  const contributionPerPeriod = annualContribution / n;

  let balance = principal;
  let totalContributions = principal;
  const yearlyData: CompoundYearRow[] = [];

  for (let year = 1; year <= years; year++) {
    const startBalance = balance;
    let yearContribution = 0;

    for (let period = 0; period < n; period++) {
      balance = balance * (1 + periodicRate) + contributionPerPeriod;
      yearContribution += contributionPerPeriod;
    }

    totalContributions += annualContribution;
    yearlyData.push({
      year,
      balance,
      contributions: totalContributions,
      interest: balance - startBalance - yearContribution,
      periodContribution: yearContribution,
    });
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest: balance - totalContributions,
    annualContribution,
    yearlyData,
  };
}
