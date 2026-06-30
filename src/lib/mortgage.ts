export type PaymentFrequency = "monthly" | "biweekly" | "weekly";

const PAYMENTS_PER_YEAR: Record<PaymentFrequency, number> = {
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

export interface AmortizationRow {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageResult {
  loanAmount: number;
  payment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  schedule: AmortizationRow[];
}

/**
 * Canadian mortgage payment calculation.
 *
 * Canadian law requires semi-annual compounding on fixed-rate mortgages.
 * The nominal annual rate (e.g. 5%) is compounded twice per year.
 *
 * Step 1: Convert nominal annual rate to effective monthly rate (Canadian):
 *   monthlyRate = (1 + annualRate/2)^(1/6) - 1
 *   (equivalent to (1 + annualRate/2)^(2/12) - 1)
 *
 * Step 2: Standard amortization payment formula:
 *   payment = principal * periodicRate * (1 + periodicRate)^n
 *             / ((1 + periodicRate)^n - 1)
 *
 * where n = total number of payments (amortization years × payments per year).
 *
 * Update annualRate input when Bank of Canada / lender rates change.
 */
export function calculateMortgage(
  homePrice: number,
  downPayment: number,
  annualRate: number,
  amortizationYears: number,
  frequency: PaymentFrequency,
): MortgageResult {
  const principal = Math.max(0, homePrice - downPayment);
  const paymentsPerYear = PAYMENTS_PER_YEAR[frequency];
  const totalPayments = amortizationYears * paymentsPerYear;

  // Semi-annual compounding: effective rate per payment period
  const semiAnnualRate = annualRate / 100 / 2;
  const periodicRate =
    Math.pow(1 + semiAnnualRate, 2 / paymentsPerYear) - 1;

  let payment = 0;
  if (principal > 0 && periodicRate > 0) {
    payment =
      (principal *
        periodicRate *
        Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);
  } else if (principal > 0) {
    payment = principal / totalPayments;
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= totalPayments; i++) {
    const interestPortion = balance * periodicRate;
    const principalPortion = payment - interestPortion;
    balance = Math.max(0, balance - principalPortion);
    totalInterest += interestPortion;

    schedule.push({
      paymentNumber: i,
      payment,
      principal: principalPortion,
      interest: interestPortion,
      balance,
    });
  }

  const totalPaymentsAmount = payment * totalPayments;

  return {
    loanAmount: principal,
    payment,
    totalPayments: totalPaymentsAmount,
    totalInterest,
    totalCost: totalPaymentsAmount + downPayment,
    schedule,
  };
}
