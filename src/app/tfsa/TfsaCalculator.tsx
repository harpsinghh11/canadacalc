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
import { LastUpdated } from "@/components/ui/LastUpdated";
import { ResultExplainer } from "@/components/ui/ResultExplainer";
import { CalculatorAssumptions } from "@/components/ui/CalculatorAssumptions";
import { OfficialSourceLinks } from "@/components/ui/OfficialSourceLinks";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { SmartTips } from "@/components/ui/SmartTips";
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
  formatContributionLabel,
} from "@/lib/contribution";
import { formatCurrency } from "@/lib/format";
import {
  TFSA_ANNUAL_LIMIT_2026,
  TFSA_CUMULATIVE_ROOM_2026,
  calculateTfsa,
  getCumulativeTfsaRoom,
} from "@/lib/tfsa";
import { getTfsaTips } from "@/lib/insights";

const DEFAULTS = {
  currentAge: 30,
  currentBalance: 15000,
  contributionAmount: 583,
  contributionFrequency: "monthly" as ContributionFrequency,
  returnRate: 6,
  province: "ON",
};

export default function TfsaCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("tfsa", DEFAULTS);
  const debounced = useDebouncedValue(inputs);

  const annualContribution = useMemo(
    () =>
      toAnnualContribution(
        debounced.contributionAmount,
        debounced.contributionFrequency,
      ),
    [debounced.contributionAmount, debounced.contributionFrequency],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (debounced.currentAge < 18) e.currentAge = "You must be 18+ to hold a TFSA";
    if (debounced.currentAge > 71) e.currentAge = "TFSA projections work best for ages 18–71";
    return e;
  }, [debounced.currentAge]);

  const cumulativeRoom = getCumulativeTfsaRoom(debounced.currentAge);

  const result = useMemo(
    () =>
      calculateTfsa(
        debounced.currentAge,
        debounced.currentBalance,
        annualContribution,
        debounced.returnRate,
      ),
    [debounced, annualContribution],
  );

  const tips = getTfsaTips(
    debounced.currentAge,
    annualContribution,
    debounced.returnRate,
    cumulativeRoom,
  );

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="TFSA Calculator"
        badge={<LastUpdated>2026 TFSA contribution limits</LastUpdated>}
        description={`Project your Tax-Free Savings Account to age 65 with CRA limits explained. 2026 annual limit: ${formatCurrency(TFSA_ANNUAL_LIMIT_2026)}.`}
        footer={
          <>
            <HowWeCalculate>
              <p>
                We project year-by-year growth: each year your balance earns
                returns, then your contribution is added (capped at the annual
                CRA limit). Contribution room starts the year you turned 18 (or
                2009, whichever is later) and accumulates each January.
              </p>
              <p>
                <strong>Limitations:</strong> Steady return rate assumed; does
                not model withdrawals, over-contributions, spousal transfers,
                residency gaps, or your personal CRA contribution room. The
                cumulative limit figure is a reference total of annual dollar
                limits — check your CRA account before contributing.
              </p>
              <OfficialSourceLinks sources={["cra", "craTfsa"]} />
            </HowWeCalculate>
            <FAQ
              items={[
                {
                  q: "How much TFSA room do I have in 2026?",
                  a: `The 2026 annual dollar limit is $7,000. The maximum cumulative TFSA dollar limits through 2026 total $${TFSA_CUMULATIVE_ROOM_2026.toLocaleString("en-CA")} for someone who was eligible and a Canadian resident for every applicable year since 2009 and has not used any contribution room. Your actual contribution room may differ based on age, residency, and past contributions or withdrawals. Check your records and CRA account before contributing.`,
                },
                {
                  q: "What happens if I over-contribute?",
                  a: "CRA charges a 1% per month penalty on excess amounts. This calculator caps contributions at annual limits to help you plan.",
                },
                {
                  q: "Are TFSA withdrawals taxed?",
                  a: "No — withdrawals are completely tax-free, and the withdrawn amount is added back to your contribution room the following year.",
                },
                {
                  q: "Does a TFSA use simple or compound interest?",
                  a: (
                    <>
                      Investments inside a TFSA typically earn{" "}
                      <Link
                        href="/compound"
                        className="font-medium text-[var(--brand)] underline"
                      >
                        compound interest
                      </Link>
                      , not simple interest. See how compounding affects growth
                      with our{" "}
                      <Link
                        href="/compound"
                        className="font-medium text-[var(--brand)] underline"
                      >
                        Compound
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/simple-interest"
                        className="font-medium text-[var(--brand)] underline"
                      >
                        Simple Interest
                      </Link>{" "}
                      calculators.
                    </>
                  ),
                  schemaText:
                    "Investments inside a TFSA typically earn compound interest, not simple interest. See how compounding affects growth with our compound or simple interest calculators.",
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
                label="Current Age"
                htmlFor="currentAge"
                tooltip="A Tax-Free Savings Account lets your investments grow without paying tax on the gains. You must be 18+ to open one."
                error={errors.currentAge}
              >
                <input
                  id="currentAge"
                  type="number"
                  value={inputs.currentAge}
                  onChange={(e) => set("currentAge", Number(e.target.value))}
                  className={errors.currentAge ? inputErrorClassName : inputClassName}
                />
              </FormField>
              <FormField label="Current TFSA Balance" htmlFor="currentBalance" tooltip="Your total TFSA balance today across all accounts.">
                <input
                  id="currentBalance"
                  type="number"
                  min={0}
                  value={inputs.currentBalance}
                  onChange={(e) => set("currentBalance", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Contribution Amount" htmlFor="contributionAmount" hint={`2026 limit: ${formatCurrency(TFSA_ANNUAL_LIMIT_2026)}/yr`}>
                <input
                  id="contributionAmount"
                  type="number"
                  min={0}
                  value={inputs.contributionAmount}
                  onChange={(e) => set("contributionAmount", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Contribution Frequency" htmlFor="contributionFrequency">
                <select
                  id="contributionFrequency"
                  value={inputs.contributionFrequency}
                  onChange={(e) => set("contributionFrequency", e.target.value as ContributionFrequency)}
                  className={selectClassName}
                >
                  {(Object.keys(CONTRIBUTION_FREQUENCY_LABELS) as ContributionFrequency[]).map((f) => (
                    <option key={f} value={f}>{CONTRIBUTION_FREQUENCY_LABELS[f]}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Expected Return Rate (%)" htmlFor="returnRate" tooltip="Average annual investment return you expect (historical stock markets average ~7-10% before inflation).">
                <input
                  id="returnRate"
                  type="number"
                  step={0.1}
                  value={inputs.returnRate}
                  onChange={(e) => set("returnRate", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Province" htmlFor="province" hint="For your reference — TFSA rules are federal and the same in every province.">
                <select id="province" value={inputs.province} onChange={(e) => set("province", e.target.value)} className={selectClassName}>
                  {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </FormField>
            </div>
          }
          results={
            <div className="min-w-0 max-w-full space-y-3">
              <ResultItem label="Projected Balance at 65" value={formatCurrency(result.projectedBalance)} numericValue={result.projectedBalance} formatFn={formatCurrency} highlight />
              <ResultItem label="Your Contribution" value={formatContributionLabel(inputs.contributionAmount, inputs.contributionFrequency)} />
              <ResultItem label="Annual Equivalent" value={formatCurrency(result.annualContribution)} numericValue={result.annualContribution} formatFn={formatCurrency} />
              <ResultItem label="Reference cumulative limits (est.)" value={formatCurrency(cumulativeRoom)} numericValue={cumulativeRoom} formatFn={formatCurrency} />
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                Sum of annual CRA dollar limits from the year you turned 18 (or
                2009) through 2026 — not your personal available contribution
                room. Check your records and CRA account before contributing.
              </p>
              <ResultItem label="Total Growth" value={formatCurrency(result.totalGrowth)} numericValue={result.totalGrowth} formatFn={formatCurrency} />
              <ResultExplainer>
                If you keep contributing at this pace until age 65, your TFSA could
                reach about <strong>{formatCurrency(result.projectedBalance)}</strong>.
                That growth is tax-free when withdrawn. The reference cumulative
                limit total for your age is about{" "}
                <strong>{formatCurrency(cumulativeRoom)}</strong> (2026 annual limits
                applied from your eligibility start year — not personalized CRA room).
              </ResultExplainer>
              <CalculatorAssumptions
                items={[
                  "2026 CRA annual contribution limit; reference cumulative limits by age only",
                  "Steady return rate and regular contributions until age 65",
                  "No withdrawals, residency history, or personalized CRA room modeled",
                ]}
              />
              <SmartTips tips={tips} />
              <ShareResultCard
                headline="My TFSA projection"
                lines={[
                  `Balance at 65: ${formatCurrency(result.projectedBalance)}`,
                  `Contributing ${formatContributionLabel(inputs.contributionAmount, inputs.contributionFrequency)}`,
                ]}
              />
              <div className="mt-6 min-w-0 max-w-full">
                <ScrollTable
                  caption="TFSA year-by-year projection"
                  compact
                  bodyClassName="max-h-80 overflow-y-auto"
                >
                  <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "24%" }} />
                  </colgroup>
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="px-2 py-2">Age</th>
                      <th className="px-2 py-2">Year</th>
                      <th className="px-2 py-2 text-right">Contrib.</th>
                      <th className="px-2 py-2 text-right">Growth</th>
                      <th className="px-2 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyData.map((row) => (
                      <tr key={row.year} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 tabular-nums">{row.age}</td>
                        <td className="px-2 py-1.5 tabular-nums">{row.year}</td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(row.contribution)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(row.growth)}
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
      <MobileResultsBar label="Balance at 65" value={formatCurrency(result.projectedBalance)} />
    </>
  );
}
