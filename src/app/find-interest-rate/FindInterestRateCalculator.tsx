"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { ScrollTable } from "@/components/ui/ScrollTable";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { CurrencyInput, NumberInput } from "@/components/ui/form-inputs";
import {
  CHART_COLORS,
  chartGridProps,
  ChartCurrencyTooltip,
  getBalanceYAxisProps,
  getChartMargins,
  getYearXAxisProps,
} from "@/components/ui/ChartParts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  type ContributionFrequency,
  CONTRIBUTION_FREQUENCY_LABELS,
  toAnnualContribution,
} from "@/lib/contribution";
import {
  calculateRequiredInterestRate,
} from "@/lib/find-interest-rate";
import { type CompoundingFrequency } from "@/lib/compound";
import { formatCurrency, formatPercent } from "@/lib/format";

const DEFAULTS = {
  principal: 10000,
  contributionAmount: 500,
  contributionFrequency: "monthly" as ContributionFrequency,
  compoundingFrequency: "monthly" as CompoundingFrequency,
  years: 20,
  targetAmount: 250000,
};

export default function FindInterestRateCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState(
    "find-interest-rate",
    DEFAULTS,
  );
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
      calculateRequiredInterestRate({
        principal: debounced.principal,
        annualContribution,
        years: debounced.years,
        targetAmount: debounced.targetAmount,
        compoundingFrequency: debounced.compoundingFrequency,
      }),
    [annualContribution, debounced],
  );

  const chartData = useMemo(
    () =>
      result.yearlyData.map((row) => ({
        year: row.year,
        balance: row.balance,
        target: debounced.targetAmount,
      })),
    [result, debounced.targetAmount],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (debounced.years < 1) e.years = "Enter at least 1 year";
    if (debounced.targetAmount <= 0)
      e.targetAmount = "Enter a target above $0";
    return e;
  }, [debounced]);

  const yAxisProps = getBalanceYAxisProps(isMobile);
  const xAxisProps = getYearXAxisProps(isMobile, debounced.years);

  const set = <K extends keyof typeof DEFAULTS>(
    key: K,
    val: (typeof DEFAULTS)[K],
  ) => setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="Find Interest Rate Calculator"
        description="Work backwards from your target balance to find the annual return rate you need."
        footer={
          <>
            <HowWeCalculate>
              <p>
                We reuse the compound interest engine and solve for the annual
                rate with a binary search until the ending balance matches your
                target. This works with recurring contributions and different
                compounding frequencies.
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                {
                  q: "What does this calculator solve for?",
                  a: "It calculates the annual compound return rate you would need to reach a target balance, given your starting amount, contributions, time horizon, and compounding frequency.",
                },
                {
                  q: "What if I can reach my target without any interest?",
                  a: "Then the required rate is 0.00%. That means your principal plus contributions alone are already enough to hit the goal.",
                },
                {
                  q: "Does this use compound or simple interest?",
                  a: (
                    <>
                      This page solves using{" "}
                      <Link
                        href="/compound"
                        className="font-medium text-[#16a34a] underline"
                      >
                        compound interest
                      </Link>
                      . If you want a straight-line growth assumption, try the{" "}
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
                    "This page solves using compound interest. If you want a straight-line growth assumption, try the Simple Interest Calculator.",
                },
                {
                  q: "What is a realistic long-term rate of return?",
                  a: "For diversified portfolios, many planners test ranges like 4% to 8%. Use lower assumptions for conservative plans and stress-test your goal with multiple scenarios.",
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
                label="Starting Amount"
                htmlFor="principal"
                tooltip="Your current balance before any future contributions."
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
                tooltip="How much you plan to add each period."
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
                label="Years"
                htmlFor="years"
                error={errors.years}
                tooltip="How long you have to reach the target."
              >
                <NumberInput
                  id="years"
                  value={inputs.years}
                  onChange={(v) => set("years", v)}
                  min={1}
                />
              </FormField>
              <FormField
                label="Target Balance"
                htmlFor="targetAmount"
                error={errors.targetAmount}
                tooltip="The future balance you want to reach."
              >
                <CurrencyInput
                  id="targetAmount"
                  value={inputs.targetAmount}
                  onChange={(v) => set("targetAmount", v)}
                  min={1}
                />
              </FormField>
              <FormField
                label="Compounding Frequency"
                htmlFor="compoundingFrequency"
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
            </div>
          }
          inputsFooter={
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">
                Year-by-Year Breakdown
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <ScrollTable
                  caption="Required interest rate year-by-year breakdown"
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
                      <tr key={row.year} className="border-t border-slate-100">
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
          }
          results={
            <div className="space-y-4">
              <ResultItem
                label="Required Annual Rate"
                value={formatPercent(result.requiredRate)}
                highlight
              />
              <ResultItem
                label="Total Contributions"
                value={formatCurrency(result.totalContributions)}
                numericValue={result.totalContributions}
                formatFn={formatCurrency}
              />
              <ResultItem
                label="Interest Needed"
                value={formatCurrency(result.totalInterest)}
                numericValue={result.totalInterest}
                formatFn={formatCurrency}
              />
              <ResultItem
                label="Projected Final Balance"
                value={formatCurrency(result.finalBalance)}
                numericValue={result.finalBalance}
                formatFn={formatCurrency}
                highlight
              />

              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <strong>Result:</strong>{" "}
                {result.targetReachedWithoutInterest
                  ? "You can reach this target without any growth."
                  : `You need about ${formatPercent(result.requiredRate)} per year to reach ${formatCurrency(debounced.targetAmount)} in ${debounced.years} years.`}
              </p>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={getChartMargins(isMobile)}
                  >
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="year" {...xAxisProps} />
                    <YAxis tickMargin={8} {...yAxisProps} />
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
                      name="Projected balance"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="linear"
                      dataKey="target"
                      name="Target"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar
        label="Required rate"
        value={formatPercent(result.requiredRate)}
      />
    </>
  );
}
