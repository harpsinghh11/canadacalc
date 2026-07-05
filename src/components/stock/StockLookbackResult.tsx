import { formatCurrency, formatPercent } from "@/lib/format";
import type { StockLookbackResult as StockResult } from "@/lib/stock";
import { ArrowRight } from "lucide-react";

interface StockLookbackResultProps {
  ticker: string;
  shares: number;
  purchaseDate: string;
  purchasePrice: number;
  currentPrice: number;
  result: StockResult;
}

export function StockLookbackResultPanel({
  ticker,
  shares,
  purchaseDate,
  purchasePrice,
  currentPrice,
  result,
}: StockLookbackResultProps) {
  const isPositive = result.profitLoss > 0;
  const isNegative = result.profitLoss < 0;
  const returnColor = isPositive
    ? "text-[var(--positive)]"
    : isNegative
      ? "text-[var(--negative)]"
      : "text-[var(--foreground)]";

  const formattedPurchaseDate = new Date(
    purchaseDate + "T12:00:00",
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {ticker}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {shares} share{shares !== 1 ? "s" : ""} · purchased{" "}
          {formattedPurchaseDate}
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span>Purchase date</span>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <p className="text-[var(--muted)]">Historical price</p>
              <p className="font-semibold tabular-nums text-[var(--foreground)]">
                {formatCurrency(purchasePrice)}
              </p>
            </div>
            <div className="flex flex-1 items-center gap-1" aria-hidden>
              <div className="h-px flex-1 bg-[var(--border-strong)]" />
              <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
              <div className="h-px flex-1 bg-[var(--border-strong)]" />
            </div>
            <div className="text-right text-sm">
              <p className="text-[var(--muted)]">Current price</p>
              <p className="font-semibold tabular-nums text-[var(--foreground)]">
                {formatCurrency(currentPrice)}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--muted)]">Could be worth today</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--foreground)] sm:text-4xl">
          {formatCurrency(result.currentValue)}
        </p>
        <p className={`mt-2 text-lg font-semibold tabular-nums ${returnColor}`}>
          {isPositive ? "+" : ""}
          {formatPercent(result.percentReturn)}
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            ({formatPercent(result.annualizedReturn)} annualized)
          </span>
        </p>
      </div>

      <dl className="grid gap-2 sm:grid-cols-2">
        <Stat label="Original value" value={formatCurrency(result.totalInvested)} />
        <Stat label="Current value" value={formatCurrency(result.currentValue)} />
        <Stat
          label="Gain / loss"
          value={`${isPositive ? "+" : ""}${formatCurrency(result.profitLoss)}`}
          valueClass={returnColor}
        />
        <Stat
          label="Return"
          value={formatPercent(result.percentReturn)}
          valueClass={returnColor}
        />
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass = "text-[var(--foreground)]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] bg-[var(--surface-muted)] px-3 py-2.5">
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className={`text-sm font-semibold tabular-nums ${valueClass}`}>
        {value}
      </dd>
    </div>
  );
}

export function StockLookbackEmptyState() {
  return (
    <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-6 py-10 text-center">
      <p className="text-sm font-medium text-[var(--foreground)]">
        Enter a ticker and past date to travel back in market history.
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Choose a symbol, purchase date, and shares — then press Look Back.
      </p>
    </div>
  );
}
