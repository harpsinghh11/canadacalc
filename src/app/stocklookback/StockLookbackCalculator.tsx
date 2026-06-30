"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  calculateStockLookback,
  formatShareMessage,
} from "@/lib/stock";
import { formatCurrency, formatPercent } from "@/lib/format";

const DEFAULTS = {
  ticker: "NVDA",
  shares: 10,
  purchaseDate: "2020-01-02",
};

interface StockPriceResponse {
  price: number;
  date: string;
  error?: string;
  code?: string;
}

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

export default function StockLookbackCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("stocklookback", DEFAULTS);
  const debounced = useDebouncedValue(inputs, 500);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [spyValue, setSpyValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confettiFired = useRef(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!debounced.ticker.trim()) e.ticker = "Enter a stock ticker";
    if (debounced.shares < 1) e.shares = "Enter at least 1 share";
    const d = new Date(debounced.purchaseDate);
    if (isNaN(d.getTime()) || d > new Date()) e.purchaseDate = "Enter a valid past date";
    if (d < new Date("2000-01-01")) e.purchaseDate = "Date must be after 2000";
    return e;
  }, [debounced]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) return;

    let cancelled = false;
    confettiFired.current = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    Promise.all([
      fetchHistoricalPrice(debounced.ticker, debounced.purchaseDate),
      fetchCurrentPrice(debounced.ticker),
      fetchHistoricalPrice("SPY", debounced.purchaseDate),
      fetchCurrentPrice("SPY"),
    ])
      .then(([purchase, current, spyPurchase, spyCurrent]) => {
        if (cancelled) return;
        setPurchasePrice(purchase);
        setCurrentPrice(current);
        const invested = debounced.shares * purchase;
        setSpyValue((invested / spyPurchase) * spyCurrent);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to fetch data right now. Please try again in a moment",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, errors]);

  const hasErrors = Object.keys(errors).length > 0;

  const result =
    purchasePrice !== null && currentPrice !== null
      ? calculateStockLookback(
          debounced.shares,
          purchasePrice,
          currentPrice,
          new Date(debounced.purchaseDate + "T12:00:00"),
        )
      : null;

  const displayResult =
    !hasErrors && !loading && !error && result ? result : null;

  useEffect(() => {
    if (displayResult && displayResult.profitLoss > 0 && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [displayResult]);

  const shareMessage =
    displayResult
      ? formatShareMessage(
          debounced.shares,
          debounced.ticker,
          new Date(debounced.purchaseDate + "T12:00:00"),
          displayResult.totalInvested,
          displayResult.currentValue,
        )
      : "";

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="Stock Lookback Tool"
        description="See what your investment would be worth today — updates live as you type."
        footer={
          <>
            <HowWeCalculate>
              <p>
                Annualized return uses (current value ÷ initial value)^(1 ÷ years) − 1.
                We fetch historical prices from Yahoo Finance for your purchase date
                and today.
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
        <ResetButton onReset={() => { resetAll(); setPurchasePrice(null); setCurrentPrice(null); }} />
        <CalculatorGrid
          inputs={
            <div>
              <FormField
                label="Stock Ticker"
                htmlFor="ticker"
                tooltip="The stock symbol, e.g. NVDA, AAPL, SHOP.TO for Canadian stocks."
                hint="Enter any stock symbol — e.g. AAPL, NVDA, SHOP.TO, RY.TO (use .TO suffix for TSX stocks)"
                error={errors.ticker}
              >
                <input id="ticker" type="text" value={inputs.ticker} onChange={(e) => set("ticker", e.target.value.toUpperCase())} className={errors.ticker ? inputErrorClassName : inputClassName} />
              </FormField>
              <FormField label="Number of Shares" htmlFor="shares" error={errors.shares}>
                <input id="shares" type="number" min={1} value={inputs.shares} onChange={(e) => set("shares", Number(e.target.value))} className={errors.shares ? inputErrorClassName : inputClassName} />
              </FormField>
              <FormField label="Purchase Date" htmlFor="purchaseDate" error={errors.purchaseDate}>
                <input id="purchaseDate" type="date" min="2000-01-01" max={new Date().toISOString().split("T")[0]} value={inputs.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} className={errors.purchaseDate ? inputErrorClassName : inputClassName} />
              </FormField>
            </div>
          }
          results={
            loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            ) : hasErrors ? (
              <p className="text-sm text-slate-500">Fix the errors above to see results.</p>
            ) : displayResult ? (
              <div className="space-y-3">
                <ResultItem label="Total Invested" value={formatCurrency(displayResult.totalInvested)} numericValue={displayResult.totalInvested} formatFn={formatCurrency} />
                <ResultItem label="Current Value" value={formatCurrency(displayResult.currentValue)} numericValue={displayResult.currentValue} formatFn={formatCurrency} highlight />
                <ResultItem label="Profit / Loss" value={formatCurrency(displayResult.profitLoss)} numericValue={displayResult.profitLoss} formatFn={formatCurrency} highlight={displayResult.profitLoss >= 0} />
                <ResultItem label="Return" value={formatPercent(displayResult.percentReturn)} />
                <ResultItem label="Annualized Return" value={formatPercent(displayResult.annualizedReturn)} />
                {spyValue !== null && !hasErrors && (
                  <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    If you had invested the same amount in the S&P 500 (SPY) instead, you&apos;d have {formatCurrency(spyValue)} today.
                  </p>
                )}
                <ShareResultCard
                  headline={shareMessage}
                  lines={[
                    `Return: ${formatPercent(displayResult.percentReturn)} (${formatPercent(displayResult.annualizedReturn)} annualized)`,
                  ]}
                  verdict={displayResult.profitLoss >= 0 ? "What a ride! 🚀" : "HODL? 📉"}
                  verdictType={displayResult.profitLoss >= 0 ? "success" : "warning"}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Enter a ticker and date to see results.</p>
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
