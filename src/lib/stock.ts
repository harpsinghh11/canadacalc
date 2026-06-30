export interface StockLookbackResult {
  purchasePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  percentReturn: number;
  annualizedReturn: number;
  yearsHeld: number;
}

export function calculateStockLookback(
  shares: number,
  purchasePrice: number,
  currentPrice: number,
  purchaseDate: Date,
): StockLookbackResult {
  const totalInvested = shares * purchasePrice;
  const currentValue = shares * currentPrice;
  const profitLoss = currentValue - totalInvested;
  const percentReturn =
    totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const now = new Date();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const yearsHeld = Math.max(
    (now.getTime() - purchaseDate.getTime()) / msPerYear,
    1 / 365,
  );

  const annualizedReturn =
    totalInvested > 0
      ? (Math.pow(currentValue / totalInvested, 1 / yearsHeld) - 1) * 100
      : 0;

  return {
    purchasePrice,
    currentPrice,
    totalInvested,
    currentValue,
    profitLoss,
    percentReturn,
    annualizedReturn,
    yearsHeld,
  };
}

export function formatShareMessage(
  shares: number,
  ticker: string,
  purchaseDate: Date,
  totalInvested: number,
  currentValue: number,
): string {
  const dateStr = purchaseDate.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const invested = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(totalInvested);
  const worth = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(currentValue);

  return `If you bought ${shares} shares of ${ticker.toUpperCase()} on ${dateStr}, your ${invested} would be worth ${worth} today 🚀`;
}
