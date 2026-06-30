import { toAnnualContribution, type ContributionFrequency } from "./contribution";

export interface RetirementYearRow {
  age: number;
  year: number;
  contribution: number;
  growth: number;
  balance: number;
  cumulativeContributions: number;
}

export interface RetirementResult {
  projectedSavings: number;
  yearsMoneyLasts: number;
  monthlyIncomeAvailable: number;
  progressPercent: number;
  totalContributed: number;
  totalGrowth: number;
  annualContribution: number;
  yearlyData: RetirementYearRow[];
}

export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  contributionAmount: number,
  contributionFrequency: ContributionFrequency,
  returnRate: number,
  monthlyExpenses: number,
): RetirementResult {
  const annualContribution = toAnnualContribution(
    contributionAmount,
    contributionFrequency,
  );
  const monthlyContribution = annualContribution / 12;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const annualRate = returnRate / 100;
  const monthlyRate = annualRate / 12;
  const currentYear = new Date().getFullYear();

  let balance = currentSavings;
  let totalContributed = currentSavings;
  const yearlyData: RetirementYearRow[] = [];

  // Year 0 snapshot
  yearlyData.push({
    age: currentAge,
    year: currentYear,
    contribution: 0,
    growth: 0,
    balance: currentSavings,
    cumulativeContributions: 0,
  });

  for (let y = 1; y <= yearsToRetirement; y++) {
    let yearContributions = 0;
    let yearGrowth = 0;

    for (let m = 0; m < 12; m++) {
      const monthGrowth = balance * monthlyRate;
      yearGrowth += monthGrowth;
      balance = balance + monthGrowth + monthlyContribution;
      yearContributions += monthlyContribution;
      totalContributed += monthlyContribution;
    }

    yearlyData.push({
      age: currentAge + y,
      year: currentYear + y,
      contribution: yearContributions,
      growth: yearGrowth,
      balance,
      cumulativeContributions: totalContributed - currentSavings,
    });
  }

  const projectedSavings = balance;
  const totalGrowth = projectedSavings - totalContributed;

  let yearsMoneyLasts = 0;
  let retirementBalance = projectedSavings;

  if (monthlyExpenses <= 0) {
    yearsMoneyLasts = Infinity;
  } else {
    const maxMonths = 600;
    for (let m = 0; m < maxMonths; m++) {
      if (retirementBalance < monthlyExpenses) break;
      retirementBalance =
        retirementBalance * (1 + monthlyRate) - monthlyExpenses;
      yearsMoneyLasts = (m + 1) / 12;
    }
    if (yearsMoneyLasts >= maxMonths / 12) {
      yearsMoneyLasts = maxMonths / 12;
    }
  }

  const monthlyIncomeAvailable =
    monthlyExpenses > 0
      ? (projectedSavings * 0.04) / 12
      : projectedSavings / 12;

  const targetSavings = monthlyExpenses * 12 * 25;
  const progressPercent =
    targetSavings > 0
      ? Math.min(100, (projectedSavings / targetSavings) * 100)
      : 100;

  return {
    projectedSavings,
    yearsMoneyLasts,
    monthlyIncomeAvailable,
    progressPercent,
    totalContributed,
    totalGrowth,
    annualContribution,
    yearlyData,
  };
}
