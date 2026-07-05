"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { CanadaCalcInsight } from "@/components/ui/CanadaCalcInsight";
import { IncomeBreakdownBar } from "@/components/ui/IncomeBreakdownBar";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { TaxResult } from "@/lib/tax";
import { TAX_YEAR } from "@/lib/tax";

interface TaxResultPanelProps {
  result: TaxResult;
  pensionLabel: string;
  isQuebec: boolean;
  grossIncome: number;
}

export function TaxResultPanel({
  result,
  pensionLabel,
  isQuebec,
  grossIncome,
}: TaxResultPanelProps) {
  const monthlyAfterTax = result.afterTaxIncome / 12;
  const pensionPayroll =
    result.cpp +
    result.cpp2 +
    result.cppSelfEmployed +
    result.ei +
    result.qpip;
  const taxTotal = result.federalTax + result.provincialTax;

  const perHundredTax =
    grossIncome > 0 ? (taxTotal / grossIncome) * 100 : 0;
  const perHundredPayroll =
    grossIncome > 0 ? (pensionPayroll / grossIncome) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Your {TAX_YEAR} tax estimate
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Estimated after-tax income
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--foreground)] sm:text-4xl">
          <AnimatedNumber
            value={result.afterTaxIncome}
            format={formatCurrency}
          />
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          ≈{" "}
          <span className="font-medium tabular-nums text-[var(--foreground)]">
            {formatCurrency(monthlyAfterTax)}
          </span>{" "}
          per month
        </p>

        <IncomeBreakdownBar
          total={grossIncome}
          segments={[
            {
              label: "Take-home",
              value: result.afterTaxIncome,
              color: "var(--positive)",
            },
            {
              label: "Income tax",
              value: taxTotal,
              color: "#b42318",
            },
            {
              label: "Contributions",
              value: pensionPayroll,
              color: "#94a3b8",
            },
          ]}
        />
      </div>

      <dl className="grid gap-2 sm:grid-cols-2">
        <Metric label="Income tax" value={formatCurrency(taxTotal)} />
        <Metric
          label={`${pensionLabel}${result.cpp2 > 0 ? " / " + pensionLabel + "2" : ""}`}
          value={formatCurrency(
            result.cpp + result.cpp2 + result.cppSelfEmployed,
          )}
        />
        <Metric label="EI" value={formatCurrency(result.ei)} />
        {isQuebec && (
          <Metric label="QPIP" value={formatCurrency(result.qpip)} />
        )}
        <Metric
          label="Effective rate"
          value={formatPercent(result.effectiveTaxRate)}
        />
        <Metric
          label="Marginal rate"
          value={formatPercent(result.marginalTaxRate)}
        />
      </dl>

      {grossIncome > 0 && (
        <CanadaCalcInsight>
          For every $100 of gross income you entered, approximately{" "}
          <strong className="text-[var(--foreground)]">
            {formatCurrency(perHundredTax)}
          </strong>{" "}
          goes to estimated income tax and{" "}
          <strong className="text-[var(--foreground)]">
            {formatCurrency(perHundredPayroll)}
          </strong>{" "}
          to employee {pensionLabel}/EI
          {isQuebec ? "/QPIP" : ""} contributions. This is an estimate — not
          tax advice.
        </CanadaCalcInsight>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] bg-[var(--surface-muted)] px-3 py-2.5">
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}
