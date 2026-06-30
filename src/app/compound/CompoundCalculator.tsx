"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  ResultItem,
  selectClassName,
} from "@/components/CalculatorLayout";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { ScrollTable } from "@/components/ui/ScrollTable";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { CurrencyInput, PercentInput, NumberInput } from "@/components/ui/form-inputs";
import {
  CHART_COLORS,
  chartGridProps,
  comparisonLegendProps,
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
  toAnnualContribution,
  formatContributionLabel,
} from "@/lib/contribution";
import {
  type CompoundingFrequency,
  calculateCompoundInterest,
} from "@/lib/compound";
import { calculateSimpleInterestWithContributions } from "@/lib/simple-interest";
import { formatCurrency } from "@/lib/format";

const DEFAULTS = {
  principal: 10000,
  contributionAmount: 417,
  contributionFrequency: "monthly" as ContributionFrequency,
  interestRate: 7,
  compareRate: 5,
  compoundingFrequency: "monthly" as CompoundingFrequency,
  years: 20,
};

export default function CompoundCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("compound", DEFAULTS);
  const [compare, setCompare] = useState(false);
  const debounced = useDebouncedValue(inputs);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const annualContribution = useMemo(
    () =>
      toAnnualContribution(
        debounced.contributionAmount,
        debounced.contributionFrequency,
      ),
    [debounced],
  );

  const result = useMemo(
    () =>
      calculateCompoundInterest(
        debounced.principal,
        annualContribution,
        debounced.interestRate,
        debounced.compoundingFrequency,
        debounced.years,
      ),
    [debounced, annualContribution],
  );

  const compareResult = useMemo(
    () =>
      compare
        ? calculateCompoundInterest(
            debounced.principal,
            annualContribution,
            debounced.compareRate,
            debounced.compoundingFrequency,
            debounced.years,
          )
        : null,
    [compare, debounced, annualContribution],
  );

  const simpleResult = useMemo(
    () =>
      calculateSimpleInterestWithContributions(
        debounced.principal,
        annualContribution,
        debounced.interestRate,
        debounced.years,
      ),
    [debounced, annualContribution],
  );

  const comparisonChartData = useMemo(
    () =>
      result.yearlyData.map((row) => {
        const simple =
          simpleResult.yearlyData[row.year]?.balance ??
          simpleResult.finalAmount;
        return {
          year: row.year,
          compound: row.balance,
          simple,
          gap: row.balance - simple,
        };
      }),
    [result, simpleResult],
  );

  const compoundVsSimpleDiff =
    result.finalBalance - simpleResult.finalAmount;

  const growthChartData = useMemo(() => {
    if (!compareResult) return result.yearlyData;
    return result.yearlyData.map((row, i) => ({
      ...row,
      compareBalance: compareResult.yearlyData[i]?.balance ?? 0,
    }));
  }, [result, compareResult]);

  const breakdownRows = useMemo(
    () =>
      result.yearlyData.map((row, i) => ({
        year: row.year,
        contributions: row.contributions,
        primaryInterest: row.interest,
        primaryBalance: row.balance,
        compareInterest: compareResult?.yearlyData[i]?.interest,
        compareBalance: compareResult?.yearlyData[i]?.balance,
      })),
    [result, compareResult],
  );

  const chartYAxis = getBalanceYAxisProps(isMobile);
  const growthXAxis = getYearXAxisProps(isMobile, debounced.years);
  const comparisonXAxis = getYearXAxisProps(isMobile, debounced.years);

  const set = <K extends keyof typeof DEFAULTS>(
    key: K,
    val: (typeof DEFAULTS)[K],
  ) => setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="Compound Interest Calculator"
        description="See how your money grows with the power of compound interest."
        footer={
          <>
            <HowWeCalculate>
              <p>
                Each period, interest is calculated on your current balance plus
                any contributions made that period. More frequent compounding
                earns slightly more over time.
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                {
                  q: "What is compound interest?",
                  a: (
                    <>
                      Interest earned on both your principal and previously
                      earned interest — your money grows exponentially over
                      time. Compare with{" "}
                      <Link
                        href="/simple-interest"
                        className="font-medium text-[#16a34a] underline"
                      >
                        simple interest
                      </Link>
                      .
                    </>
                  ),
                  schemaText:
                    "Interest earned on both your principal and previously earned interest — your money grows exponentially over time. Compare with simple interest on our Simple Interest Calculator.",
                },
                {
                  q: "How often should interest compound?",
                  a: "Daily compounding yields slightly more than annual, but the difference is modest compared to saving consistently.",
                },
                {
                  q: "What's the difference between compound and simple interest?",
                  a: (
                    <>
                      Compound interest earns returns on your returns; simple
                      interest only applies to the original principal. See the
                      comparison below or try our{" "}
                      <Link
                        href="/simple-interest"
                        className="font-medium text-[#16a34a] underline"
                      >
                        Simple Interest Calculator
                      </Link>
                      .
                    </>
                  ),
                  schemaText:
                    "Compound interest earns returns on your returns; simple interest only applies to the original principal. See the comparison on this page or try our Simple Interest Calculator.",
                },
              ]}
            />
          </>
        }
      >
        <ResetButton
          onReset={() => {
            resetAll();
            setCompare(false);
          }}
        />
        <label className="mb-4 flex min-h-[44px] items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="h-4 w-4 rounded text-[#16a34a]"
          />
          Compare two interest rate scenarios
        </label>
        <CalculatorGrid
          compare={
            compare ? (
              <FormField label="Compare Rate (%)" htmlFor="compareRate">
                <PercentInput
                  id="compareRate"
                  value={inputs.compareRate}
                  onChange={(v) => set("compareRate", v)}
                  step={0.1}
                />
              </FormField>
            ) : undefined
          }
          inputs={
            <div>
              <FormField
                label="Starting Amount"
                htmlFor="principal"
                tooltip="Your initial lump sum before any contributions."
              >
                <CurrencyInput
                  id="principal"
                  value={inputs.principal}
                  onChange={(v) => set("principal", v)}
                  min={0}
                />
              </FormField>
              <FormField label="Contribution Amount" htmlFor="contributionAmount">
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
              <FormField label="Interest Rate (%)" htmlFor="interestRate">
                <PercentInput
                  id="interestRate"
                  value={inputs.interestRate}
                  onChange={(v) => set("interestRate", v)}
                  step={0.1}
                  min={0}
                />
              </FormField>
              <FormField
                label="Compounding Frequency"
                htmlFor="compoundingFrequency"
                tooltip="How often interest is calculated and added to your balance."
              >
                <select
                  id="compoundingFrequency"
                  value={inputs.compoundingFrequency}
                  onChange={(e) =>
                    set(
                      "compoundingFrequency",
                      e.target.value as CompoundingFrequency,
                    )
                  }
                  className={selectClassName}
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </FormField>
              <FormField label="Years" htmlFor="years">
                <NumberInput
                  id="years"
                  value={inputs.years}
                  onChange={(v) => set("years", v)}
                  min={1}
                />
              </FormField>
            </div>
          }
          inputsFooter={
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">
                Year-by-Year Breakdown
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <ScrollTable
                  caption="Compound interest year-by-year breakdown"
                  compact={!compare}
                >
                  {compare ? (
                    <colgroup>
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "20%" }} />
                    </colgroup>
                  ) : (
                    <colgroup>
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "30%" }} />
                    </colgroup>
                  )}
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="px-2 py-2">Year</th>
                      <th className="px-2 py-2 text-right">Contributions</th>
                      <th className="px-2 py-2 text-right">
                        Interest ({debounced.interestRate}%)
                      </th>
                      <th className="px-2 py-2 text-right">
                        Balance ({debounced.interestRate}%)
                      </th>
                      {compare && compareResult && (
                        <>
                          <th className="px-2 py-2 text-right">
                            Interest ({debounced.compareRate}%)
                          </th>
                          <th className="px-2 py-2 text-right">
                            Balance ({debounced.compareRate}%)
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownRows.map((row) => (
                      <tr
                        key={row.year}
                        className="border-t border-slate-100"
                      >
                        <td className="px-2 py-1.5 tabular-nums">{row.year}</td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(row.contributions)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-[#16a34a]">
                          {formatCurrency(row.primaryInterest)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(row.primaryBalance)}
                        </td>
                        {compare && compareResult && (
                          <>
                            <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-[#0f172a]">
                              {formatCurrency(row.compareInterest ?? 0)}
                            </td>
                            <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                              {formatCurrency(row.compareBalance ?? 0)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </ScrollTable>
              </div>
            </div>
          }
          results={
            <div className="space-y-3">
              <ResultItem
                label="Final Balance"
                value={formatCurrency(result.finalBalance)}
                numericValue={result.finalBalance}
                formatFn={formatCurrency}
                highlight
              />
              {compareResult && (
                <ResultItem
                  label={`At ${debounced.compareRate}%`}
                  value={formatCurrency(compareResult.finalBalance)}
                  numericValue={compareResult.finalBalance}
                  formatFn={formatCurrency}
                />
              )}
              <ResultItem
                label="Total Contributions"
                value={formatCurrency(result.totalContributions)}
                numericValue={result.totalContributions}
                formatFn={formatCurrency}
              />
              <ResultItem
                label="Total Interest"
                value={formatCurrency(result.totalInterest)}
                numericValue={result.totalInterest}
                formatFn={formatCurrency}
              />
              <ShareResultCard
                headline={`${debounced.years}-year growth plan`}
                lines={[
                  `${formatContributionLabel(inputs.contributionAmount, inputs.contributionFrequency)} at ${debounced.interestRate}%`,
                  `Final: ${formatCurrency(result.finalBalance)}`,
                ]}
              />

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">
                  Compound growth over time
                </h3>
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={growthChartData}
                      margin={getChartMargins(isMobile)}
                    >
                      <CartesianGrid {...chartGridProps} />
                      <XAxis dataKey="year" {...growthXAxis} />
                      <YAxis tickMargin={8} {...chartYAxis} />
                      <Tooltip content={<ChartCurrencyTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        fill={CHART_COLORS.primary}
                        fillOpacity={0.12}
                        stroke="none"
                        legendType="none"
                        tooltipType="none"
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        name={`${debounced.interestRate}%`}
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2.5}
                        dot={false}
                      />
                      {compareResult && (
                        <Line
                          type="monotone"
                          dataKey="compareBalance"
                          name={`${debounced.compareRate}%`}
                          stroke={CHART_COLORS.compare}
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-[#0f172a]">
                  📊 How does this compare to simple interest?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  With compound interest, you&apos;ll earn{" "}
                  <strong>
                    {formatCurrency(Math.max(0, compoundVsSimpleDiff))}
                  </strong>{" "}
                  more than simple interest over {debounced.years} years.
                </p>
                <div className="mt-4 h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={comparisonChartData}
                      margin={getChartMargins(isMobile, { withLegend: true })}
                    >
                      <CartesianGrid {...chartGridProps} />
                      <XAxis dataKey="year" {...comparisonXAxis} />
                      <YAxis tickMargin={8} {...chartYAxis} />
                      <Tooltip content={<ChartCurrencyTooltip />} />
                      <Legend {...comparisonLegendProps} />
                      <Area
                        type="monotone"
                        dataKey="simple"
                        stackId="compare"
                        fill="transparent"
                        stroke="none"
                        legendType="none"
                        tooltipType="none"
                      />
                      <Area
                        type="monotone"
                        dataKey="gap"
                        stackId="compare"
                        fill={CHART_COLORS.gapFill}
                        fillOpacity={0.15}
                        stroke="none"
                        legendType="none"
                        tooltipType="none"
                      />
                      <Line
                        type="monotone"
                        dataKey="compound"
                        name="Compound"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="linear"
                        dataKey="simple"
                        name="Simple"
                        stroke={CHART_COLORS.secondary}
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  Just want simple interest?{" "}
                  <Link
                    href="/simple-interest"
                    className="font-medium text-[#16a34a] underline hover:text-[#15803d]"
                  >
                    Try our Simple Interest Calculator →
                  </Link>
                </p>
              </div>
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar
        label="Final balance"
        value={formatCurrency(result.finalBalance)}
      />
    </>
  );
}
