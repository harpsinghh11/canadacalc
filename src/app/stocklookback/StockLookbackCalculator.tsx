"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  ResultItem,
  inputClassName,
  inputErrorClassName,
} from "@/components/CalculatorLayout";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  CHART_COLORS,
  ChartPortfolioComparisonTooltip,
  chartGridProps,
  comparisonLegendProps,
  getBalanceYAxisProps,
  getChartMargins,
  getDateXAxisProps,
  ReferenceInvestmentLabel,
} from "@/components/ui/ChartParts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  buildNormalizedChartData,
  calculateStockLookback,
  formatBenchmarkCallout,
  formatShareComparisonLine,
  formatShareMessage,
  isSpyProxyTicker,
  type PricePoint,
} from "@/lib/stock";
import { formatCurrency, formatPercent } from "@/lib/format";

const DEFAULTS = {
  ticker: "NVDA",
  shares: 10,
  purchaseDate: "2020-01-02",
};

const CHART_UNAVAILABLE_MESSAGE =
  "Unable to load price history right now, but your totals above are accurate.";
const SPY_CHART_UNAVAILABLE_MESSAGE =
  "S&P 500 comparison unavailable right now.";

interface StockPriceResponse {
  price: number;
  date: string;
  error?: string;
  code?: string;
}

type SeriesFetchResult =
  | { ok: true; series: PricePoint[] }
  | { ok: false };

async function fetchHistoricalPrice(
  ticker: string,
  date: string,
): Promise<number> {
  const res = await fetch(
    `/api/stockprice?ticker=${encodeURIComponent(ticker)}&date=${date}`,
  );
  const data: StockPriceResponse = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
  return data.price;
}

async function fetchCurrentPrice(ticker: string): Promise<number> {
  const res = await fetch(
    `/api/stockprice?ticker=${encodeURIComponent(ticker)}&current=true`,
  );
  const data: StockPriceResponse = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
  return data.price;
}

async function fetchPriceSeries(
  ticker: string,
  startDate: string,
  endDate: string,
): Promise<PricePoint[]> {
  const res = await fetch(
    `/api/stockprice?ticker=${encodeURIComponent(ticker)}&startDate=${startDate}&endDate=${endDate}`,
  );
  const data = (await res.json()) as {
    series?: PricePoint[];
    error?: string;
    code?: string;
  };
  if (!res.ok) {
    if (data.code === "RATE_LIMIT" || data.code === "NETWORK") {
      throw new Error("CHART_UNAVAILABLE");
    }
    throw new Error(data.error ?? "Failed to fetch price history");
  }
  return data.series ?? [];
}

async function fetchPriceSeriesSafe(
  ticker: string,
  startDate: string,
  endDate: string,
): Promise<SeriesFetchResult> {
  try {
    const series = await fetchPriceSeries(ticker, startDate, endDate);
    if (series.length === 0) return { ok: false };
    return { ok: true, series };
  } catch {
    return { ok: false };
  }
}

export default function StockLookbackCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("stocklookback", DEFAULTS);
  const [submittedInputs, setSubmittedInputs] = useState(DEFAULTS);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [spyValue, setSpyValue] = useState<number | null>(null);
  const [spyPurchasePrice, setSpyPurchasePrice] = useState<number | null>(null);
  const [chartSeries, setChartSeries] = useState<PricePoint[]>([]);
  const [spyChartSeries, setSpyChartSeries] = useState<PricePoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [spyChartUnavailable, setSpyChartUnavailable] = useState(false);
  const confettiFired = useRef(false);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const isSubmittedSpyProxy = isSpyProxyTicker(submittedInputs.ticker);
  const showSpyBenchmark = !isSubmittedSpyProxy;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!inputs.ticker.trim()) e.ticker = "Enter a stock ticker";
    if (inputs.shares < 1) e.shares = "Enter at least 1 share";
    const d = new Date(inputs.purchaseDate);
    if (isNaN(d.getTime()) || d > new Date()) e.purchaseDate = "Enter a valid past date";
    if (d < new Date("2000-01-01")) e.purchaseDate = "Date must be after 2000";
    return e;
  }, [inputs]);

  const hasErrors = Object.keys(errors).length > 0;

  const result =
    purchasePrice !== null && currentPrice !== null
      ? calculateStockLookback(
          submittedInputs.shares,
          purchasePrice,
          currentPrice,
          new Date(submittedInputs.purchaseDate + "T12:00:00"),
        )
      : null;

  const displayResult =
    !hasErrors && !loading && !error && result ? result : null;

  const chartData = useMemo(() => {
    if (!displayResult || chartSeries.length === 0) return [];
    return buildNormalizedChartData(
      chartSeries,
      showSpyBenchmark && spyChartSeries ? spyChartSeries : null,
      displayResult.totalInvested,
      purchasePrice ?? displayResult.purchasePrice,
      showSpyBenchmark ? spyPurchasePrice : null,
    );
  }, [
    chartSeries,
    spyChartSeries,
    displayResult,
    purchasePrice,
    spyPurchasePrice,
    showSpyBenchmark,
  ]);

  const hasSpyChartLine =
    showSpyBenchmark &&
    !spyChartUnavailable &&
    chartData.some((point) => point.spyValue !== undefined);

  const isPositiveReturn = (displayResult?.profitLoss ?? 0) >= 0;
  const lineColor = isPositiveReturn ? CHART_COLORS.primary : CHART_COLORS.negative;
  const fillColor = isPositiveReturn
    ? CHART_COLORS.gapFill
    : CHART_COLORS.negativeFill;

  const benchmarkCallout = useMemo(() => {
    if (!displayResult || !showSpyBenchmark || spyValue === null) return null;
    return formatBenchmarkCallout(
      submittedInputs.ticker,
      displayResult.totalInvested,
      displayResult.currentValue,
      spyValue,
    );
  }, [displayResult, showSpyBenchmark, spyValue, submittedInputs.ticker]);

  useEffect(() => {
    if (displayResult && displayResult.profitLoss > 0 && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [displayResult]);

  const shareMessage =
    displayResult
      ? formatShareMessage(
          submittedInputs.shares,
          submittedInputs.ticker,
          new Date(submittedInputs.purchaseDate + "T12:00:00"),
          displayResult.totalInvested,
          displayResult.currentValue,
        )
      : "";

  const shareLines = useMemo(() => {
    if (!displayResult) return [];
    const lines = [
      `Return: ${formatPercent(displayResult.percentReturn)} (${formatPercent(displayResult.annualizedReturn)} annualized)`,
    ];
    if (showSpyBenchmark && spyValue !== null) {
      lines.push(formatShareComparisonLine(spyValue));
    }
    return lines;
  }, [displayResult, showSpyBenchmark, spyValue]);

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const loadChartSeries = async (
    ticker: string,
    purchaseDate: string,
    includeSpy: boolean,
  ) => {
    setChartLoading(true);
    setChartError(null);
    setChartSeries([]);
    setSpyChartSeries(null);
    setSpyChartUnavailable(false);

    const endDate = new Date().toISOString().split("T")[0]!;

    const stockPromise = fetchPriceSeriesSafe(ticker, purchaseDate, endDate);
    const spyPromise = includeSpy
      ? fetchPriceSeriesSafe("SPY", purchaseDate, endDate)
      : Promise.resolve({ ok: false as const });

    const [stockResult, spyResult] = await Promise.all([stockPromise, spyPromise]);

    if (!stockResult.ok) {
      setChartSeries([]);
      setSpyChartSeries(null);
      setChartError(CHART_UNAVAILABLE_MESSAGE);
      setChartLoading(false);
      return;
    }

    setChartSeries(stockResult.series);

    if (includeSpy) {
      if (spyResult.ok) {
        setSpyChartSeries(spyResult.series);
      } else {
        setSpyChartSeries(null);
        setSpyChartUnavailable(true);
      }
    }

    setChartLoading(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    const cleanedTicker = inputs.ticker.trim().toUpperCase();
    const nextInputs = { ...inputs, ticker: cleanedTicker };
    const isSpyProxy = isSpyProxyTicker(cleanedTicker);
    setInputs(nextInputs);

    const nextErrors: Record<string, string> = {};
    if (!cleanedTicker) nextErrors.ticker = "Enter a stock ticker";
    if (nextInputs.shares < 1) nextErrors.shares = "Enter at least 1 share";
    const d = new Date(nextInputs.purchaseDate);
    if (isNaN(d.getTime()) || d > new Date()) {
      nextErrors.purchaseDate = "Enter a valid past date";
    }
    if (d < new Date("2000-01-01")) {
      nextErrors.purchaseDate = "Date must be after 2000";
    }
    if (Object.keys(nextErrors).length > 0) {
      setError(null);
      return;
    }

    confettiFired.current = false;
    setLoading(true);
    setError(null);
    setChartError(null);
    setChartSeries([]);
    setSpyChartSeries(null);
    setSpyChartUnavailable(false);

    try {
      const [purchase, current] = await Promise.all([
        fetchHistoricalPrice(nextInputs.ticker, nextInputs.purchaseDate),
        fetchCurrentPrice(nextInputs.ticker),
      ]);

      let nextSpyPurchase: number | null = null;
      let nextSpyValue: number | null = null;

      if (!isSpyProxy) {
        const [spyPurchase, spyCurrent] = await Promise.all([
          fetchHistoricalPrice("SPY", nextInputs.purchaseDate),
          fetchCurrentPrice("SPY"),
        ]);
        nextSpyPurchase = spyPurchase;
        const invested = nextInputs.shares * purchase;
        nextSpyValue = (invested / spyPurchase) * spyCurrent;
      }

      setSubmittedInputs(nextInputs);
      setPurchasePrice(purchase);
      setCurrentPrice(current);
      setSpyPurchasePrice(nextSpyPurchase);
      setSpyValue(nextSpyValue);

      void loadChartSeries(nextInputs.ticker, nextInputs.purchaseDate, !isSpyProxy);
    } catch (err: unknown) {
      setPurchasePrice(null);
      setCurrentPrice(null);
      setSpyValue(null);
      setSpyPurchasePrice(null);
      setChartSeries([]);
      setSpyChartSeries(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch data right now. Please try again in a moment",
      );
    } finally {
      setLoading(false);
    }
  };

  const stockLineName = submittedInputs.ticker.toUpperCase();

  return (
    <>
      <CalculatorLayout
        title="Stock Lookback Tool"
        description="See what your investment would be worth today — look up a stock when you're ready."
        footer={
          <>
            <HowWeCalculate>
              <p>
                Annualized return uses (current value ÷ initial value)^(1 ÷ years) − 1.
                We fetch historical prices from Yahoo Finance for your purchase date
                and today, including a portfolio value chart compared to the S&P 500 (SPY).
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                { q: "Where does the price data come from?", a: "We use Yahoo Finance historical data via our server to avoid browser restrictions." },
                { q: "What is annualized return?", a: "The average yearly growth rate that would turn your initial investment into the current value over the holding period." },
                { q: "Does this include dividends?", a: "No — this uses share price only. Total return with dividends would be higher for dividend-paying stocks." },
              ]}
            />
          </>
        }
      >
        <ResetButton
          onReset={() => {
            resetAll();
            setSubmittedInputs(DEFAULTS);
            setPurchasePrice(null);
            setCurrentPrice(null);
            setSpyValue(null);
            setSpyPurchasePrice(null);
            setChartSeries([]);
            setSpyChartSeries(null);
            setSpyChartUnavailable(false);
            setChartError(null);
            setError(null);
          }}
        />
        <CalculatorGrid
          inputs={
            <form onSubmit={handleSubmit}>
              <FormField
                label="Stock Ticker"
                htmlFor="ticker"
                tooltip="The stock symbol, e.g. NVDA, AAPL, SHOP.TO for Canadian stocks."
                hint="Enter any stock symbol — e.g. AAPL, NVDA, SHOP.TO, RY.TO (use .TO suffix for TSX stocks)"
                error={errors.ticker}
              >
                <input
                  id="ticker"
                  type="text"
                  value={inputs.ticker}
                  onChange={(e) => {
                    set("ticker", e.target.value.toUpperCase());
                    setError(null);
                  }}
                  onBlur={(e) => set("ticker", e.target.value.trim().toUpperCase())}
                  className={errors.ticker ? inputErrorClassName : inputClassName}
                />
              </FormField>
              <FormField label="Number of Shares" htmlFor="shares" error={errors.shares}>
                <input
                  id="shares"
                  type="number"
                  min={1}
                  value={inputs.shares}
                  onChange={(e) => {
                    set("shares", Number(e.target.value));
                    setError(null);
                  }}
                  className={errors.shares ? inputErrorClassName : inputClassName}
                />
              </FormField>
              <FormField label="Purchase Date" htmlFor="purchaseDate" error={errors.purchaseDate}>
                <input
                  id="purchaseDate"
                  type="date"
                  min="2000-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  value={inputs.purchaseDate}
                  onChange={(e) => {
                    set("purchaseDate", e.target.value);
                    setError(null);
                  }}
                  className={errors.purchaseDate ? inputErrorClassName : inputClassName}
                />
              </FormField>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#16a34a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Looking up..." : "Look Up Stock"}
              </button>
            </form>
          }
          results={
            loading ? (
              <div className="min-w-0 max-w-full space-y-3">
                <p className="text-sm font-medium text-slate-600">Looking up stock data...</p>
                <LoadingSkeleton />
              </div>
            ) : error ? (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            ) : hasErrors ? (
              <p className="text-sm text-slate-500">Fix the errors above, then press Enter or click Look Up Stock.</p>
            ) : displayResult ? (
              <div className="min-w-0 max-w-full space-y-3">
                <ResultItem label="Total Invested" value={formatCurrency(displayResult.totalInvested)} numericValue={displayResult.totalInvested} formatFn={formatCurrency} />
                <ResultItem label="Current Value" value={formatCurrency(displayResult.currentValue)} numericValue={displayResult.currentValue} formatFn={formatCurrency} highlight />
                <ResultItem label="Profit / Loss" value={formatCurrency(displayResult.profitLoss)} numericValue={displayResult.profitLoss} formatFn={formatCurrency} highlight={displayResult.profitLoss >= 0} />
                <ResultItem label="Return" value={formatPercent(displayResult.percentReturn)} />
                <ResultItem label="Annualized Return" value={formatPercent(displayResult.annualizedReturn)} />

                <div className="pt-2">
                  <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">
                    Your investment over time
                  </h3>
                  {chartLoading ? (
                    <div className="min-w-0 max-w-full space-y-3">
                      <p className="text-sm text-slate-600">Loading price history...</p>
                      <div className="h-64 animate-pulse rounded-lg bg-slate-200 sm:h-72" />
                    </div>
                  ) : chartError ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {chartError}
                    </p>
                  ) : chartData.length > 0 ? (
                    <div className="min-w-0 max-w-full space-y-3">
                      {isSubmittedSpyProxy ? (
                        <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                          You invested directly in the S&amp;P 500 — nice diversified choice.
                        </p>
                      ) : benchmarkCallout ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                          <p>{benchmarkCallout.base}</p>
                          <p className="mt-1 font-medium">{benchmarkCallout.outcome}</p>
                        </div>
                      ) : null}

                      <div className="min-w-0 max-w-full h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={chartData}
                            margin={getChartMargins(isMobile, {
                              withLegend: hasSpyChartLine,
                              withReferenceLabel: true,
                            })}
                          >
                            <CartesianGrid {...chartGridProps} />
                            <XAxis
                              dataKey="date"
                              {...getDateXAxisProps(isMobile, chartData.length)}
                            />
                            <YAxis tickMargin={8} {...getBalanceYAxisProps(isMobile)} />
                            <Tooltip
                              content={
                                <ChartPortfolioComparisonTooltip
                                  stockLabel={stockLineName}
                                />
                              }
                            />
                            {hasSpyChartLine && <Legend {...comparisonLegendProps} />}
                            <ReferenceLine
                              y={displayResult.totalInvested}
                              stroke={CHART_COLORS.secondary}
                              strokeDasharray="4 4"
                              label={ReferenceInvestmentLabel}
                            />
                            <Area
                              id="stock-value-area"
                              type="monotone"
                              dataKey="value"
                              name={stockLineName}
                              stroke={lineColor}
                              strokeWidth={2.5}
                              fill={fillColor}
                              fillOpacity={0.12}
                              dot={false}
                              activeDot={{ r: 4 }}
                            />
                            {hasSpyChartLine && (
                              <Line
                                id="spy-benchmark-line"
                                key="spy-line"
                                name="S&P 500 (SPY)"
                                stroke={CHART_COLORS.benchmark}
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={false}
                                connectNulls
                              />
                            )}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {spyChartUnavailable && (
                        <p className="text-xs text-slate-500">
                          {SPY_CHART_UNAVAILABLE_MESSAGE}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <ShareResultCard
                  headline={shareMessage}
                  lines={shareLines}
                  verdict={displayResult.profitLoss >= 0 ? "What a ride! 🚀" : "HODL? 📉"}
                  verdictType={displayResult.profitLoss >= 0 ? "success" : "warning"}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Enter a ticker and purchase details, then press Enter or click Look Up Stock.</p>
            )
          }
        />
      </CalculatorLayout>
      {displayResult && (
        <MobileResultsBar label="Current value" value={formatCurrency(displayResult.currentValue)} />
      )}
    </>
  );
}
