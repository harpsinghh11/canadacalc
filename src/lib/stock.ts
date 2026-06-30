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

export interface PricePoint {
  date: string;
  price: number;
}

export interface PortfolioChartPoint {
  date: string;
  value: number;
  spyValue?: number;
}

/** S&P 500 ETF tickers — skip redundant benchmark when user already holds one. */
const SPY_PROXY_TICKERS = new Set([
  "SPY",
  "VOO",
  "IVV",
  "SPLG",
  "OEF",
]);

export function isSpyProxyTicker(ticker: string): boolean {
  return SPY_PROXY_TICKERS.has(ticker.trim().toUpperCase());
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

export function formatShareComparisonLine(spyValue: number): string {
  const spyFormatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(spyValue);
  return `(vs ${spyFormatted} if S&P 500)`;
}

export function buildNormalizedChartData(
  stockSeries: PricePoint[],
  spySeries: PricePoint[] | null,
  totalInvested: number,
  stockBasePrice: number,
  spyBasePrice: number | null,
): PortfolioChartPoint[] {
  if (stockBasePrice <= 0) return [];

  const dateSet = new Set<string>();
  for (const point of stockSeries) dateSet.add(point.date);
  if (spySeries) {
    for (const point of spySeries) dateSet.add(point.date);
  }

  const stockMap = new Map(stockSeries.map((point) => [point.date, point.price]));
  const spyMap = spySeries
    ? new Map(spySeries.map((point) => [point.date, point.price]))
    : null;

  let lastStock: number | null = null;
  let lastSpy: number | null = null;

  return [...dateSet]
    .sort()
    .map((date) => {
      if (stockMap.has(date)) lastStock = stockMap.get(date)!;
      if (spyMap?.has(date)) lastSpy = spyMap.get(date)!;

      const point: PortfolioChartPoint = { date, value: 0 };
      if (lastStock !== null) {
        point.value = totalInvested * (lastStock / stockBasePrice);
      }
      if (lastSpy !== null && spyBasePrice && spyBasePrice > 0) {
        point.spyValue = totalInvested * (lastSpy / spyBasePrice);
      }
      return point;
    })
    .filter((point) => point.value > 0 || point.spyValue !== undefined);
}

export function formatBenchmarkCallout(
  ticker: string,
  totalInvested: number,
  currentValue: number,
  spyValue: number,
): { base: string; outcome: string } {
  const invested = formatCompactCurrency(totalInvested);
  const spyFormatted = formatCompactCurrency(spyValue);
  const base = `If you'd invested the same ${invested} in the S&P 500 instead, you'd have ${spyFormatted} today.`;

  const difference = Math.abs(currentValue - spyValue);
  const diffFormatted = formatCompactCurrency(difference);
  const symbol = ticker.toUpperCase();

  if (currentValue >= spyValue) {
    const pctMore =
      spyValue > 0 ? ((currentValue - spyValue) / spyValue) * 100 : 0;
    return {
      base,
      outcome: `🎉 ${symbol} beat the S&P 500 by ${diffFormatted} (${pctMore.toFixed(0)}% more)`,
    };
  }

  return {
    base,
    outcome: `📊 The S&P 500 would have earned you ${diffFormatted} more than ${symbol}`,
  };
}

function formatCompactCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}
