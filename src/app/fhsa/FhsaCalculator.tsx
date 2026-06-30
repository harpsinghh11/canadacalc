"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  ResultItem,
  inputClassName,
  inputErrorClassName,
  selectClassName,
} from "@/components/CalculatorLayout";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { ScrollTable } from "@/components/ui/ScrollTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PROVINCES } from "@/lib/constants";
import {
  type ContributionFrequency,
  CONTRIBUTION_FREQUENCY_LABELS,
  toAnnualContribution,
} from "@/lib/contribution";
import {
  FHSA_ANNUAL_LIMIT,
  FHSA_LIFETIME_LIMIT,
  calculateFhsa,
} from "@/lib/fhsa";
import { formatCurrency } from "@/lib/format";

const DEFAULTS = {
  currentAge: 28,
  province: "ON",
  contributionAmount: 667,
  contributionFrequency: "monthly" as ContributionFrequency,
  returnRate: 5,
  targetPurchaseYear: new Date().getFullYear() + 5,
};

export default function FhsaCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("fhsa", DEFAULTS);
  const debounced = useDebouncedValue(inputs);

  const annualContribution = useMemo(
    () => toAnnualContribution(debounced.contributionAmount, debounced.contributionFrequency),
    [debounced],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (debounced.currentAge < 18) e.currentAge = "You must be 18+ to open an FHSA";
    if (debounced.currentAge >= 71) e.currentAge = "FHSA must be closed by age 71";
    return e;
  }, [debounced.currentAge]);

  const result = useMemo(
    () => calculateFhsa(debounced.currentAge, debounced.province, annualContribution, debounced.returnRate, debounced.targetPurchaseYear),
    [debounced, annualContribution],
  );

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="FHSA Calculator"
        description={`Plan your First Home Savings Account. Annual limit: ${formatCurrency(FHSA_ANNUAL_LIMIT)}. Lifetime: ${formatCurrency(FHSA_LIFETIME_LIMIT)}.`}
        footer={
          <>
            <HowWeCalculate>
              <p>
                FHSA contributions are tax-deductible and growth is tax-free. We enforce
                $8,000/year, up to $16,000 with 1-year carryforward, $40,000 lifetime cap,
                and account closure by age 71 or 15 years (whichever comes first).
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                { q: "What is an FHSA?", a: "A First Home Savings Account combines RRSP tax deductions with TFSA-like tax-free growth for first-time home buyers." },
                { q: "Can I carry forward unused FHSA room?", a: "Yes — unused room carries forward one year only, allowing up to $16,000 in a single year." },
                { q: "What if I don't buy a home?", a: "You can transfer to an RRSP tax-free or withdraw (taxable) before the account expires at 15 years or age 71." },
                {
                  q: "How does FHSA investment growth work?",
                  a: (
                    <>
                      Growth inside an FHSA is tax-free and typically compounds
                      over time. Compare{" "}
                      <Link
                        href="/compound"
                        className="font-medium text-[#16a34a] underline"
                      >
                        compound
                      </Link>{" "}
                      vs{" "}
                      <Link
                        href="/simple-interest"
                        className="font-medium text-[#16a34a] underline"
                      >
                        simple interest
                      </Link>{" "}
                      growth with our calculators.
                    </>
                  ),
                  schemaText:
                    "Growth inside an FHSA is tax-free and typically compounds over time. Compare compound vs simple interest growth with our calculators.",
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
              <FormField label="Current Age" htmlFor="currentAge" tooltip="The FHSA is for Canadian residents 18–71 saving for a first home." error={errors.currentAge}>
                <input id="currentAge" type="number" value={inputs.currentAge} onChange={(e) => set("currentAge", Number(e.target.value))} className={errors.currentAge ? inputErrorClassName : inputClassName} />
              </FormField>
              <FormField label="Province" htmlFor="province" tooltip="Used to estimate your marginal tax refund on contributions.">
                <select id="province" value={inputs.province} onChange={(e) => set("province", e.target.value)} className={selectClassName}>
                  {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
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
              <FormField label="Target Home Purchase Year" htmlFor="targetPurchaseYear">
                <input id="targetPurchaseYear" type="number" value={inputs.targetPurchaseYear} onChange={(e) => set("targetPurchaseYear", Number(e.target.value))} className={inputClassName} />
              </FormField>
            </div>
          }
          results={
            <div className="min-w-0 max-w-full space-y-3">
              <ResultItem label={`Balance (${debounced.targetPurchaseYear})`} value={formatCurrency(result.projectedBalance)} numericValue={result.projectedBalance} formatFn={formatCurrency} highlight />
              <ResultItem label="Tax Refunds (est.)" value={formatCurrency(result.totalTaxRefunds)} numericValue={result.totalTaxRefunds} formatFn={formatCurrency} />
              <ResultItem label="Tax-Free Growth" value={formatCurrency(result.totalGrowth)} numericValue={result.totalGrowth} formatFn={formatCurrency} />
              {result.lifetimeLimitWarning && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                  Warning: Plan hits the {formatCurrency(FHSA_LIFETIME_LIMIT)} lifetime limit.
                </p>
              )}
              {result.accountExpiryWarning && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">{result.accountExpiryWarning}</p>
              )}
              <ShareResultCard
                headline="My FHSA for my first home 🏡"
                lines={[
                  `Target: ${debounced.targetPurchaseYear}`,
                  `Projected: ${formatCurrency(result.projectedBalance)}`,
                  `Tax refunds: ${formatCurrency(result.totalTaxRefunds)}`,
                ]}
              />
              <div className="mt-6 min-w-0 max-w-full">
                <ScrollTable
                  caption="FHSA year-by-year projection"
                  compact
                  bodyClassName="max-h-80 overflow-y-auto"
                >
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "26%" }} />
                    <col style={{ width: "26%" }} />
                    <col style={{ width: "28%" }} />
                  </colgroup>
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="px-2 py-2">Year</th>
                      <th className="px-2 py-2 text-right">Contrib.</th>
                      <th className="px-2 py-2 text-right">Refund</th>
                      <th className="px-2 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyData.map((row) => (
                      <tr key={row.year} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 tabular-nums">{row.year}</td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(row.contribution)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(row.taxRefund)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right font-medium tabular-nums">
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ScrollTable>
              </div>
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar label="FHSA balance" value={formatCurrency(result.projectedBalance)} />
    </>
  );
}
