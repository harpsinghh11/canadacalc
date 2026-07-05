"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  ResultItem,
  selectClassName,
} from "@/components/CalculatorLayout";
import { ResultExplainer } from "@/components/ui/ResultExplainer";
import { CalculatorAssumptions } from "@/components/ui/CalculatorAssumptions";
import { OfficialSourceLinks } from "@/components/ui/OfficialSourceLinks";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { ScrollTable } from "@/components/ui/ScrollTable";
import { CurrencyInput, PercentInput, NumberInput } from "@/components/ui/form-inputs";
import {
  CHART_COLORS,
  chartGridProps,
  ChartCurrencyTooltip,
  getChartMargins,
  getBalanceYAxisProps,
  getYearXAxisProps,
} from "@/components/ui/ChartParts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  type ContributionFrequency,
  CONTRIBUTION_FREQUENCY_LABELS,
} from "@/lib/contribution";
import { calculateSimpleInterest } from "@/lib/simple-interest";
import { formatCurrency } from "@/lib/format";

const DEFAULTS = {
  principal: 10000,
  contributionAmount: 200,
  contributionFrequency: "monthly" as ContributionFrequency,
  annualRate: 5,
  years: 10,
};

export default function SimpleInterestCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState(
    "simple-interest",
    DEFAULTS,
  );
  const debounced = useDebouncedValue(inputs);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const result = useMemo(
    () =>
      calculateSimpleInterest({
        principal: debounced.principal,
        annualRate: debounced.annualRate,
        years: debounced.years,
        contributionAmount: debounced.contributionAmount,
        contributionFrequency: debounced.contributionFrequency,
      }),
    [debounced],
  );

  const yAxisProps = getBalanceYAxisProps(isMobile);
  const xAxisProps = getYearXAxisProps(isMobile, debounced.years);

  const set = <K extends keyof typeof DEFAULTS>(
    key: K,
    val: (typeof DEFAULTS)[K],
  ) => setInputs((prev) => ({ ...prev, [key]: val }));

  const hasContributions =
    debounced.contributionFrequency !== "none" &&
    debounced.contributionAmount > 0;

  return (
    <>
      <CalculatorLayout
        title="Simple Interest Calculator"
        description="Calculate simple interest on a principal amount — straightforward, no compounding."
        footer={
          <>
            <HowWeCalculate>
              <p>
                Simple interest applies only to each dollar for the time it is
                invested. Your principal earns rate × years; each contribution
                earns simple interest only from the date it is added. Formula:{" "}
                <strong>Total = Principal × (1 + rate × years)</strong> plus
                interest on each contribution for its remaining period.
              </p>
              <p>
                <strong>Limitations:</strong> Most Canadian savings products use
                compound interest instead; no taxes, fees, or inflation modeled.
              </p>
              <OfficialSourceLinks sources={["bankOfCanada", "fcac"]} />
            </HowWeCalculate>
            <FAQ
              items={[
                {
                  q: "What is simple interest?",
                  a: "Simple interest is calculated only on the original amount you invest or borrow — not on any interest you've already earned. The formula is I = P × r × t.",
                },
                {
                  q: "Where is simple interest actually used?",
                  a: "Certain bonds, some personal loans, and car loans sometimes use simple interest. Most Canadian savings accounts and investments use compound interest instead.",
                  schemaText:
                    "Certain bonds, some personal loans, and car loans sometimes use simple interest. Most Canadian savings accounts and investments use compound interest instead.",
                },
                {
                  q: "Is simple interest better or worse than compound interest?",
                  a: "For savers, compound interest is better — you earn interest on your interest. Simple interest grows in a straight line.",
                },
                {
                  q: "How do I calculate simple interest by hand?",
                  a: "Multiply principal × annual rate (as a decimal) × number of years. Example: $10,000 at 5% for 3 years = $10,000 × 0.05 × 3 = $1,500 interest. Total = $11,500.",
                },
              ]}
            />
          </>
        }
      >
        <ResetButton onReset={resetAll} />
        <CalculatorGrid
          inputs={
            <div>
              <FormField
                label="Principal Amount"
                htmlFor="principal"
                tooltip="The starting amount of money — your initial deposit or loan principal."
              >
                <CurrencyInput
                  id="principal"
                  value={inputs.principal}
                  onChange={(v) => set("principal", v)}
                  min={0}
                />
              </FormField>
              <FormField
                label="Contribution Amount"
                htmlFor="contributionAmount"
                tooltip="Optional recurring contribution. Set frequency to None to disable."
              >
                <CurrencyInput
                  id="contributionAmount"
                  value={inputs.contributionAmount}
                  onChange={(v) => set("contributionAmount", v)}
                  min={0}
                />
              </FormField>
              <FormField
                label="Contribution Frequency"
                htmlFor="contributionFrequency"
              >
                <select
                  id="contributionFrequency"
                  value={inputs.contributionFrequency}
                  onChange={(e) =>
                    set(
                      "contributionFrequency",
                      e.target.value as ContributionFrequency,
                    )
                  }
                  className={selectClassName}
                >
                  {(
                    Object.keys(
                      CONTRIBUTION_FREQUENCY_LABELS,
                    ) as ContributionFrequency[]
                  ).map((f) => (
                    <option key={f} value={f}>
                      {CONTRIBUTION_FREQUENCY_LABELS[f]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Annual Interest Rate (%)"
                htmlFor="annualRate"
                tooltip="The yearly interest rate as a percentage, e.g. 5 for 5%."
              >
                <PercentInput
                  id="annualRate"
                  value={inputs.annualRate}
                  onChange={(v) => set("annualRate", v)}
                  min={0}
                  step={0.1}
                />
              </FormField>
              <FormField
                label="Time Period (Years)"
                htmlFor="years"
                tooltip="How long the money earns interest."
              >
                <NumberInput
                  id="years"
                  value={inputs.years}
                  onChange={(v) => set("years", v)}
                  min={1}
                />
              </FormField>
            </div>
          }
          results={
            <div className="min-w-0 max-w-full space-y-4">
              <ResultItem
                label="Total Contributions"
                value={formatCurrency(result.totalContributions)}
                numericValue={result.totalContributions}
                formatFn={formatCurrency}
              />
              <ResultItem
                label="Total Interest Earned"
                value={formatCurrency(result.totalInterest)}
                numericValue={result.totalInterest}
                formatFn={formatCurrency}
                highlight
              />
              <ResultItem
                label="Final Balance"
                value={formatCurrency(result.finalAmount)}
                numericValue={result.finalAmount}
                formatFn={formatCurrency}
                highlight
              />
              <ResultExplainer>
                Over <strong>{debounced.years} years</strong> at{" "}
                <strong>{debounced.annualRate}%</strong> simple interest, you would
                earn about <strong>{formatCurrency(result.totalInterest)}</strong>{" "}
                on top of <strong>{formatCurrency(result.totalContributions)}</strong>{" "}
                in contributions, for a final balance of about{" "}
                <strong>{formatCurrency(result.finalAmount)}</strong>.
              </ResultExplainer>
              <CalculatorAssumptions
                items={[
                  `Fixed ${debounced.annualRate}% rate with no compounding`,
                  "Interest calculated only on principal and each contribution's remaining time",
                  "No taxes, fees, or inflation adjustment",
                  "Level contributions at the frequency you selected",
                ]}
              />
              <ShareResultCard
                headline={`${debounced.years}-year simple interest`}
                lines={[
                  `${formatCurrency(debounced.principal)} at ${debounced.annualRate}%`,
                  `Final: ${formatCurrency(result.finalAmount)}`,
                ]}
              />
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <strong>Formula:</strong> Total = Principal × (1 + rate × years)
                {hasContributions && " + interest on each contribution"}
                <br />
                <span className="text-slate-500">
                  = {formatCurrency(debounced.principal)} × (1 +{" "}
                  {debounced.annualRate}% × {debounced.years} yr)
                  {hasContributions && " + contribution interest"}
                </span>
              </p>

              <div className="min-w-0 max-w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={result.yearlyData}
                    margin={getChartMargins(isMobile)}
                  >
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="year" {...xAxisProps} />
                    <YAxis tickMargin={8} {...yAxisProps} />
                    <Tooltip content={<ChartCurrencyTooltip />} />
                    <Area
                      type={hasContributions ? "monotone" : "linear"}
                      dataKey="balance"
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.12}
                      stroke="none"
                      legendType="none"
                      tooltipType="none"
                    />
                    <Line
                      type={hasContributions ? "monotone" : "linear"}
                      dataKey="balance"
                      name="Balance"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">
                  Year-by-Year Breakdown
                </h3>
                <div className="min-w-0 max-w-full max-h-96 overflow-y-auto">
                  <ScrollTable
                    caption="Simple interest year-by-year breakdown"
                    compact
                  >
                    <colgroup>
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "30%" }} />
                    </colgroup>
                    <thead className="sticky top-0 bg-slate-100">
                      <tr>
                        <th className="px-2 py-2">Year</th>
                        <th className="px-2 py-2 text-right">Contributions</th>
                        <th className="px-2 py-2 text-right">Interest</th>
                        <th className="px-2 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyData.map((row) => (
                        <tr
                          key={row.year}
                          className="border-t border-slate-100"
                        >
                          <td className="px-2 py-1.5 tabular-nums">{row.year}</td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                            {formatCurrency(row.contributions)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                            {formatCurrency(row.interest)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                            {formatCurrency(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ScrollTable>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  💡 Most savings accounts and investments actually use{" "}
                  <strong>compound interest</strong>, which grows faster. See
                  how much more you could earn →{" "}
                  <Link
                    href="/compound"
                    className="font-semibold text-[var(--brand)] underline hover:text-[var(--brand-hover)]"
                  >
                    Compound Interest Calculator
                  </Link>
                </p>
              </div>
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar
        label="Final balance"
        value={formatCurrency(result.finalAmount)}
      />
    </>
  );
}
