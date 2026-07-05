import { formatCurrency } from "./format";
import { TFSA_ANNUAL_LIMIT_2026 } from "./tfsa";
import { estimateCmhcPremium } from "./cmhc";
import { type TaxInput } from "./tax";
import { calculateRetirement } from "./retirement";
import { toAnnualContribution, type ContributionFrequency } from "./contribution";

export interface SmartTip {
  type: "info" | "warning" | "success";
  text: string;
}

export function getMortgageTips(
  homePrice: number,
  downPayment: number,
  amortizationYears: number,
): SmartTip[] {
  const tips: SmartTip[] = [];
  if (homePrice <= 0) return tips;

  const cmhc = estimateCmhcPremium(homePrice, downPayment);

  if (cmhc.required && cmhc.premium > 0) {
    tips.push({
      type: "warning",
      text: `With less than 20% down, you'll need CMHC mortgage insurance — estimated ${formatCurrency(cmhc.premium)} added to your mortgage (${cmhc.rate.toFixed(2)}% of loan).`,
    });
  }

  if (amortizationYears > 25 && homePrice > 0 && downPayment / homePrice < 0.2) {
    tips.push({
      type: "warning",
      text: "Amortization over 25 years with less than 20% down may not qualify with all lenders — check with your mortgage broker.",
    });
  }

  return tips;
}

export function getTfsaTips(
  currentAge: number,
  annualContribution: number,
  returnRate: number,
  cumulativeRoom: number,
): SmartTip[] {
  const tips: SmartTip[] = [];

  const gap = TFSA_ANNUAL_LIMIT_2026 - annualContribution;
  const extraPerMonth = gap / 12;

  if (extraPerMonth <= 0) {
    tips.push({
      type: "success",
      text: "🎉 You're maxing your TFSA — great work! Maxing your TFSA every year is one of the best financial moves a Canadian can make.",
    });
  } else if (extraPerMonth > 1) {
    const yearsTo65 = Math.max(0, 65 - currentAge);
    const months = yearsTo65 * 12;
    const monthlyRate = returnRate / 100 / 12;

    let projectedExtra = 0;
    if (months > 0) {
      if (monthlyRate > 0) {
        projectedExtra =
          extraPerMonth *
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      } else {
        projectedExtra = extraPerMonth * months;
      }
    }

    if (projectedExtra > 0) {
      tips.push({
        type: "info",
        text: `💡 Contributing an extra ${formatCurrency(extraPerMonth)}/month (maxing your TFSA) would add ${formatCurrency(projectedExtra)} to your balance by age 65`,
      });
    }
  }

  tips.push({
    type: "info",
    text: `Reference only: cumulative annual TFSA dollar limits since you turned 18 total about ${formatCurrency(cumulativeRoom)} through 2026 — not your personalized CRA contribution room. Check your CRA account before contributing.`,
  });

  return tips;
}

export function getTaxTips(
  input: TaxInput,
  marginalRate: number,
): SmartTip[] {
  const tips: SmartTip[] = [];
  const earned =
    input.employmentIncome +
    input.selfEmploymentIncome +
    input.rentalIncome;

  if (earned > 50000 && input.rrspContribution < earned * 0.1) {
    const extra = Math.min(earned * 0.1 - input.rrspContribution, 10000);
    const savings = extra * (marginalRate / 100);
    if (extra > 500 && savings > 0) {
      tips.push({
        type: "info",
        text: `Contributing ${formatCurrency(extra)} more to your RRSP could save you about ${formatCurrency(savings)} in taxes this year.`,
      });
    }
  }

  return tips;
}

export function getRetirementTips(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  contributionAmount: number,
  contributionFrequency: ContributionFrequency,
  returnRate: number,
  monthlyExpenses: number,
): SmartTip[] {
  const tips: SmartTip[] = [];
  const result = calculateRetirement(
    currentAge,
    retirementAge,
    currentSavings,
    contributionAmount,
    contributionFrequency,
    returnRate,
    monthlyExpenses,
  );

  const target = monthlyExpenses * 12 * 25;

  if (result.projectedSavings >= target) {
    tips.push({
      type: "success",
      text: `You're on track to retire at ${retirementAge} with your current plan ✅`,
    });
  } else {
    const years = Math.max(1, retirementAge - currentAge);
    const months = years * 12;
    const r = returnRate / 100 / 12;
    const fv = target;
    const pv = currentSavings * Math.pow(1 + r, months);
    let needed = 0;
    if (r > 0) {
      needed =
        ((fv - pv) * r) /
        (Math.pow(1 + r, months) - 1);
    } else {
      needed = (fv - currentSavings) / months;
    }
    const currentMonthly =
      toAnnualContribution(contributionAmount, contributionFrequency) / 12;
    const extra = Math.max(0, needed - currentMonthly);
    if (extra > 1) {
      tips.push({
        type: "warning",
        text: `You need about ${formatCurrency(Math.ceil(extra))} more per month to hit your retirement goal at ${retirementAge}.`,
      });
    }
  }

  return tips;
}

export function getBracketAverageTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 57375) return 18;
  if (taxableIncome <= 114750) return 24;
  if (taxableIncome <= 158519) return 28;
  if (taxableIncome <= 220000) return 31;
  return 33;
}
