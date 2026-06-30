import {
  calculateCompoundInterest,
  type CompoundingFrequency,
  type CompoundResult,
} from "./compound";

export interface FindInterestRateInput {
  principal: number;
  annualContribution: number;
  years: number;
  targetAmount: number;
  compoundingFrequency: CompoundingFrequency;
}

export interface FindInterestRateResult {
  requiredRate: number;
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
  yearlyData: CompoundResult["yearlyData"];
  targetReachedWithoutInterest: boolean;
}

function resultForRate(
  input: FindInterestRateInput,
  rate: number,
): CompoundResult {
  return calculateCompoundInterest(
    input.principal,
    input.annualContribution,
    rate,
    input.compoundingFrequency,
    input.years,
  );
}

/**
 * Solve for the annual nominal rate needed to reach a target balance using
 * the existing compound-interest engine. Binary search is stable here because
 * final balance is monotonic with respect to the interest rate.
 */
export function calculateRequiredInterestRate(
  input: FindInterestRateInput,
): FindInterestRateResult {
  const zeroRate = resultForRate(input, 0);

  if (zeroRate.finalBalance >= input.targetAmount) {
    return {
      requiredRate: 0,
      totalContributions: zeroRate.totalContributions,
      totalInterest: zeroRate.totalInterest,
      finalBalance: zeroRate.finalBalance,
      yearlyData: zeroRate.yearlyData,
      targetReachedWithoutInterest: true,
    };
  }

  let low = 0;
  let high = 20;
  let highResult = resultForRate(input, high);

  while (highResult.finalBalance < input.targetAmount && high < 1000) {
    high *= 2;
    highResult = resultForRate(input, high);
  }

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const midResult = resultForRate(input, mid);
    if (midResult.finalBalance >= input.targetAmount) {
      high = mid;
      highResult = midResult;
    } else {
      low = mid;
    }
  }

  return {
    requiredRate: high,
    totalContributions: highResult.totalContributions,
    totalInterest: highResult.totalInterest,
    finalBalance: highResult.finalBalance,
    yearlyData: highResult.yearlyData,
    targetReachedWithoutInterest: false,
  };
}
