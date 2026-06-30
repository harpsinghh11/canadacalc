"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  ResultItem,
  inputClassName,
  selectClassName,
} from "@/components/CalculatorLayout";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { SmartTips } from "@/components/ui/SmartTips";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  type ContributionFrequency,
  CONTRIBUTION_FREQUENCY_LABELS,
} from "@/lib/contribution";
import { calculateRetirement } from "@/lib/retirement";
import { getRetirementTips } from "@/lib/insights";
import { formatCurrency } from "@/lib/format";

const DEFAULTS = {
  currentAge: 35,
  retirementAge: 65,
  currentSavings: 50000,
  contributionAmount: 500,
  contributionFrequency: "monthly" as ContributionFrequency,
  returnRate: 6,
  monthlyExpenses: 4000,
};

export default function RetirementCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("retirement", DEFAULTS);
  const debounced = useDebouncedValue(inputs);

  const result = useMemo(
    () =>
      calculateRetirement(
        debounced.currentAge,
        debounced.retirementAge,
        debounced.currentSavings,
        debounced.contributionAmount,
        debounced.contributionFrequency,
        debounced.returnRate,
        debounced.monthlyExpenses,
      ),
    [debounced],
  );

  const tips = getRetirementTips(
    debounced.currentAge,
    debounced.retirementAge,
    debounced.currentSavings,
    debounced.contributionAmount,
    debounced.contributionFrequency,
    debounced.returnRate,
    debounced.monthlyExpenses,
  );

  const target = debounced.monthlyExpenses * 12 * 25;
  const onTrack = result.projectedSavings >= target;
  const verdict = onTrack
    ? `You're on track to retire at ${debounced.retirementAge} ✅`
    : tips[0]?.text ?? `Keep saving to reach your goal at ${debounced.retirementAge}`;

  const yearsLabel =
    result.yearsMoneyLasts >= 50 ? "50+ years" : `${result.yearsMoneyLasts.toFixed(1)} years`;

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="Retirement Calculator"
        description="Estimate your retirement savings and how long your money will last."
        footer={
          <>
            <HowWeCalculate>
              <p>
                We compound your savings monthly until retirement, then simulate
                withdrawals month-by-month while your remaining balance continues
                to earn returns — not simple division. The &quot;money lasts&quot;
                figure accounts for growth during drawdown.
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                { q: "What is the 4% rule?", a: "A common guideline: withdraw 4% of your portfolio annually in retirement. We use this for sustainable income estimates." },
                { q: "Should I include CPP and OAS?", a: "This calculator focuses on personal savings. Add government benefits separately for a complete picture." },
                {
                  q: "What return rate should I use?",
                  a: (
                    <>
                      Conservative planners use 4–5%, moderate 6–7%. Historical
                      balanced portfolios averaged ~6–8%. Model growth with our{" "}
                      <Link
                        href="/compound"
                        className="font-medium text-[#16a34a] underline"
                      >
                        Compound Interest
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/simple-interest"
                        className="font-medium text-[#16a34a] underline"
                      >
                        Simple Interest
                      </Link>{" "}
                      calculators.
                    </>
                  ),
                  schemaText:
                    "Conservative planners use 4–5%, moderate 6–7%. Historical balanced portfolios averaged about 6–8%. Model growth with our compound or simple interest calculators.",
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
              <FormField label="Current Age" htmlFor="currentAge" tooltip="Your age today.">
                <input id="currentAge" type="number" value={inputs.currentAge} onChange={(e) => set("currentAge", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Retirement Age" htmlFor="retirementAge" tooltip="When you plan to stop working and start drawing on savings.">
                <input id="retirementAge" type="number" value={inputs.retirementAge} onChange={(e) => set("retirementAge", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Current Savings" htmlFor="currentSavings" tooltip="Total retirement savings today (RRSP, TFSA, pension, etc.).">
                <input id="currentSavings" type="number" value={inputs.currentSavings} onChange={(e) => set("currentSavings", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Contribution Amount" htmlFor="contributionAmount">
                <input id="contributionAmount" type="number" value={inputs.contributionAmount} onChange={(e) => set("contributionAmount", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Contribution Frequency" htmlFor="contributionFrequency">
                <select id="contributionFrequency" value={inputs.contributionFrequency} onChange={(e) => set("contributionFrequency", e.target.value as ContributionFrequency)} className={selectClassName}>
                  {(Object.keys(CONTRIBUTION_FREQUENCY_LABELS) as ContributionFrequency[]).map((f) => (
                    <option key={f} value={f}>{CONTRIBUTION_FREQUENCY_LABELS[f]}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Expected Return Rate (%)" htmlFor="returnRate">
                <input id="returnRate" type="number" step={0.1} value={inputs.returnRate} onChange={(e) => set("returnRate", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Monthly Expenses in Retirement" htmlFor="monthlyExpenses" tooltip="How much you expect to spend each month after retiring.">
                <input id="monthlyExpenses" type="number" value={inputs.monthlyExpenses} onChange={(e) => set("monthlyExpenses", Number(e.target.value))} className={inputClassName} />
              </FormField>
            </div>
          }
          results={
            <div className="space-y-3">
              <ResultItem label="Retirement Savings" value={formatCurrency(result.projectedSavings)} numericValue={result.projectedSavings} formatFn={formatCurrency} highlight />
              <ResultItem label="Money Lasts" value={yearsLabel} />
              <ResultItem label="Monthly Income (4% rule)" value={formatCurrency(result.monthlyIncomeAvailable)} numericValue={result.monthlyIncomeAvailable} formatFn={formatCurrency} />
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">Goal Progress</span>
                  <span>{result.progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[#16a34a] transition-all" style={{ width: `${Math.min(100, result.progressPercent)}%` }} />
                </div>
              </div>
              <SmartTips tips={tips} />
              <ShareResultCard
                headline="My retirement plan"
                lines={[`Savings at ${debounced.retirementAge}: ${formatCurrency(result.projectedSavings)}`]}
                verdict={verdict}
                verdictType={onTrack ? "success" : "warning"}
              />
              <div className="mt-6 max-h-64 overflow-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="px-3 py-2">Age</th>
                      <th className="px-3 py-2 text-right">Contrib.</th>
                      <th className="px-3 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyData.map((row) => (
                      <tr key={row.year} className="border-t border-slate-100">
                        <td className="px-3 py-2">{row.age}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(row.contribution)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar label="Retirement savings" value={formatCurrency(result.projectedSavings)} />
    </>
  );
}
