/** Simplified CMHC mortgage default insurance premium rates (2025) */
export function estimateCmhcPremium(
  homePrice: number,
  downPayment: number,
): { rate: number; premium: number; required: boolean } {
  if (homePrice <= 0) return { rate: 0, premium: 0, required: false };

  const downPercent = (downPayment / homePrice) * 100;
  if (downPercent >= 20) return { rate: 0, premium: 0, required: false };

  const loanAmount = homePrice - downPayment;
  let rate = 0;

  if (downPercent >= 15) rate = 0.028;
  else if (downPercent >= 10) rate = 0.031;
  else if (downPercent >= 5) rate = 0.04;
  else rate = 0.04;

  return {
    rate: rate * 100,
    premium: loanAmount * rate,
    required: true,
  };
}
