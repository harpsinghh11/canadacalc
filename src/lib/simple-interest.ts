import {
  type ContributionFrequency,
  CONTRIBUTION_PERIODS_PER_YEAR,
} from "./contribution";

export interface SimpleInterestYearRow {
  year: number;
  balance: number;
  interest: number;
  contributions: number;
}

export interface SimpleInterestResult {
  totalInterest: number;
  totalContributions: number;
  finalAmount: number;
  yearlyData: SimpleInterestYearRow[];
}

export interface SimpleInterestInput {
  principal: number;
  annualRate: number;
  years: number;
  contributionAmount?: number;
  contributionFrequency?: ContributionFrequency;
}

interface ContributionEvent {
  amount: number;
  year: number;
}

function getPeriodsPerYear(
  frequency: ContributionFrequency | undefined,
): number {
  if (!frequency || frequency === "none") return 0;
  return CONTRIBUTION_PERIODS_PER_YEAR[frequency];
}

function buildContributionEvents(
  contributionAmount: number,
  frequency: ContributionFrequency | undefined,
  years: number,
): ContributionEvent[] {
  const periodsPerYear = getPeriodsPerYear(frequency);
  if (periodsPerYear === 0 || contributionAmount <= 0 || years <= 0) {
    return [];
  }

  const totalPeriods = Math.floor(years * periodsPerYear);
  const events: ContributionEvent[] = [];

  for (let p = 1; p <= totalPeriods; p++) {
    events.push({
      amount: contributionAmount,
      year: p / periodsPerYear,
    });
  }

  return events;
}

function calculateAtYear(
  principal: number,
  rate: number,
  year: number,
  events: ContributionEvent[],
): { balance: number; interest: number; contributions: number } {
  const principalInterest = principal * rate * year;
  let contributionTotal = 0;
  let contributionInterest = 0;

  for (const event of events) {
    if (event.year > year) continue;
    contributionTotal += event.amount;
    const remaining = Math.max(0, year - event.year);
    contributionInterest += event.amount * rate * remaining;
  }

  const interest = principalInterest + contributionInterest;
  const balance = principal + contributionTotal + interest;

  return { balance, interest, contributions: principal + contributionTotal };
}

/**
 * Simple interest with optional periodic contributions.
 * Principal earns simple interest for full duration; each contribution earns
 * simple interest only for the time remaining after it was deposited.
 */
export function calculateSimpleInterest(
  input: SimpleInterestInput | number,
  annualRate?: number,
  years?: number,
): SimpleInterestResult {
  const params: SimpleInterestInput =
    typeof input === "number"
      ? { principal: input, annualRate: annualRate ?? 0, years: years ?? 0 }
      : input;

  const {
    principal,
    annualRate: ratePct,
    years: totalYears,
    contributionAmount = 0,
    contributionFrequency,
  } = params;

  const rate = ratePct / 100;
  const safeYears = Math.max(0, Math.floor(totalYears));
  const events = buildContributionEvents(
    contributionAmount,
    contributionFrequency,
    safeYears,
  );

  const final = calculateAtYear(principal, rate, safeYears, events);
  const contributionSum = events.reduce((sum, e) => sum + e.amount, 0);

  const yearlyData: SimpleInterestYearRow[] = [];
  for (let year = 0; year <= safeYears; year++) {
    const snapshot = calculateAtYear(principal, rate, year, events);
    yearlyData.push({
      year,
      balance: snapshot.balance,
      interest: snapshot.interest,
      contributions: snapshot.contributions,
    });
  }

  return {
    totalInterest: final.interest,
    totalContributions: principal + contributionSum,
    finalAmount: final.balance,
    yearlyData,
  };
}

/** Annual-lump comparison helper used by the compound calculator. */
export function calculateSimpleInterestWithContributions(
  principal: number,
  annualContribution: number,
  annualRate: number,
  years: number,
): SimpleInterestResult {
  if (annualContribution <= 0) {
    return calculateSimpleInterest({ principal, annualRate, years });
  }

  const rate = annualRate / 100;
  const safeYears = Math.max(0, Math.floor(years));
  const events: ContributionEvent[] = [];

  for (let y = 1; y <= safeYears; y++) {
    events.push({ amount: annualContribution, year: y });
  }

  const final = calculateAtYear(principal, rate, safeYears, events);
  const contributionSum = annualContribution * safeYears;

  const yearlyData: SimpleInterestYearRow[] = [];
  for (let year = 0; year <= safeYears; year++) {
    const snapshot = calculateAtYear(principal, rate, year, events);
    yearlyData.push({
      year,
      balance: snapshot.balance,
      interest: snapshot.interest,
      contributions: snapshot.contributions,
    });
  }

  return {
    totalInterest: final.interest,
    totalContributions: principal + contributionSum,
    finalAmount: final.balance,
    yearlyData,
  };
}
