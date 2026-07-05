import type { TaxBracket } from "./types";

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

export function getMarginalBracketRate(
  income: number,
  brackets: TaxBracket[],
): number {
  if (income <= 0) return 0;
  for (const bracket of brackets) {
    if (income <= bracket.max) return bracket.rate;
  }
  return brackets[brackets.length - 1]?.rate ?? 0;
}
