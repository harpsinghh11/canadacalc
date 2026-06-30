"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { SmartTips } from "@/components/ui/SmartTips";
import { ScrollTable } from "@/components/ui/ScrollTable";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateMortgage, type PaymentFrequency } from "@/lib/mortgage";
import { getMortgageTips } from "@/lib/insights";
import { formatCurrency } from "@/lib/format";

const DEFAULTS = {
  homePrice: 600000,
  downPayment: 60000,
  interestRate: 5.25,
  compareRate: 6.25,
  amortizationYears: 25,
  frequency: "monthly" as PaymentFrequency,
};

export default function MortgageCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState(
    "mortgage",
    DEFAULTS,
  );
  const [showAll, setShowAll] = useState(false);
  const [compare, setCompare] = useState(false);
  const debounced = useDebouncedValue(inputs);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (debounced.downPayment >= debounced.homePrice && debounced.homePrice > 0) {
      e.downPayment = "Down payment must be less than home price";
    }
    if (debounced.homePrice <= 0) e.homePrice = "Enter a valid home price";
    return e;
  }, [debounced]);

  const result = useMemo(
    () =>
      calculateMortgage(
        Math.max(0, debounced.homePrice),
        Math.min(debounced.downPayment, debounced.homePrice),
        debounced.interestRate,
        debounced.amortizationYears,
        debounced.frequency,
      ),
    [debounced],
  );

  const compareResult = useMemo(
    () =>
      compare
        ? calculateMortgage(
            Math.max(0, debounced.homePrice),
            Math.min(debounced.downPayment, debounced.homePrice),
            debounced.compareRate,
            debounced.amortizationYears,
            debounced.frequency,
          )
        : null,
    [compare, debounced],
  );

  const tips = getMortgageTips(
    debounced.homePrice,
    debounced.downPayment,
    debounced.amortizationYears,
  );

  const frequencyLabel =
    debounced.frequency === "monthly"
      ? "Monthly"
      : debounced.frequency === "biweekly"
        ? "Biweekly"
        : "Weekly";

  const visibleSchedule = showAll
    ? result.schedule
    : result.schedule.slice(0, 12);

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="Mortgage Calculator"
        description="Calculate your Canadian mortgage payments using semi-annual compounding, as required by Canadian law."
        footer={
          <>
            <HowWeCalculate>
              <p>
                Canadian mortgages use <strong>semi-annual compounding</strong>,
                not monthly. We convert your annual rate to an effective monthly
                rate with: (1 + rate÷2)^(1/6) − 1, then apply the standard
                amortization payment formula. This is different from US mortgages
                that simply divide the annual rate by 12.
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                {
                  q: "How is Canadian mortgage interest calculated?",
                  a: (
                    <>
                      Canadian law requires lenders to compound interest
                      semi-annually — not simple interest. Your quoted annual
                      rate is compounded twice per year, then converted to your
                      payment frequency. Learn more about{" "}
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
                      </Link>
                      .
                    </>
                  ),
                  schemaText:
                    "Canadian law requires lenders to compound interest semi-annually, not simple interest. Your quoted annual rate is compounded twice per year, then converted to your payment frequency. Learn more about compound vs simple interest.",
                },
                {
                  q: "What is the difference between biweekly and accelerated biweekly?",
                  a: "This calculator uses standard biweekly payments (26 per year). Accelerated biweekly divides your monthly payment in half and pays it every two weeks, resulting in one extra monthly payment per year.",
                },
                {
                  q: "Do I need CMHC insurance?",
                  a: "If your down payment is less than 20% of the home price, you typically need mortgage default insurance from CMHC or another provider.",
                },
                {
                  q: "Can I get a 30-year amortization in Canada?",
                  a: "30-year amortization is generally only available with 20%+ down payment. Insured mortgages (less than 20% down) are typically capped at 25 years.",
                },
              ]}
            />
          </>
        }
      >
        <ResetButton
          onReset={() => {
            resetAll();
            setShowAll(false);
            setCompare(false);
          }}
        />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="rounded border-slate-300 text-[#16a34a]"
          />
          Compare two interest rate scenarios
        </label>
        <CalculatorGrid
          compare={
            compare ? (
              <FormField label="Compare Rate (%)" htmlFor="compareRate">
                <input
                  id="compareRate"
                  type="number"
                  step={0.05}
                  value={inputs.compareRate}
                  onChange={(e) => set("compareRate", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
            ) : undefined
          }
          inputs={
            <div>
              <FormField
                label="Home Price"
                htmlFor="homePrice"
                tooltip="The total purchase price of the home before any deductions."
                error={errors.homePrice}
              >
                <input
                  id="homePrice"
                  type="number"
                  min={0}
                  value={inputs.homePrice}
                  onChange={(e) => set("homePrice", Number(e.target.value))}
                  className={errors.homePrice ? inputErrorClassName : inputClassName}
                />
              </FormField>
              <FormField
                label="Down Payment"
                htmlFor="downPayment"
                tooltip="Cash you pay upfront. Less than 20% usually requires mortgage insurance."
                error={errors.downPayment}
              >
                <input
                  id="downPayment"
                  type="number"
                  min={0}
                  value={inputs.downPayment}
                  onChange={(e) => set("downPayment", Number(e.target.value))}
                  className={errors.downPayment ? inputErrorClassName : inputClassName}
                />
              </FormField>
              <FormField
                label="Interest Rate (%)"
                htmlFor="interestRate"
                tooltip="Your annual mortgage interest rate from your lender."
              >
                <input
                  id="interestRate"
                  type="number"
                  step={0.05}
                  value={inputs.interestRate}
                  onChange={(e) => set("interestRate", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Amortization (Years)" htmlFor="amortizationYears">
                <select
                  id="amortizationYears"
                  value={inputs.amortizationYears}
                  onChange={(e) =>
                    set("amortizationYears", Number(e.target.value))
                  }
                  className={selectClassName}
                >
                  {Array.from({ length: 26 }, (_, i) => i + 5).map((y) => (
                    <option key={y} value={y}>
                      {y} years
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Payment Frequency" htmlFor="frequency">
                <select
                  id="frequency"
                  value={inputs.frequency}
                  onChange={(e) =>
                    set("frequency", e.target.value as PaymentFrequency)
                  }
                  className={selectClassName}
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </FormField>
            </div>
          }
          results={
            <div className="space-y-3">
              <ResultItem
                label={`${frequencyLabel} Payment`}
                value={formatCurrency(result.payment, 2)}
                numericValue={result.payment}
                formatFn={(n) => formatCurrency(n, 2)}
                highlight
              />
              {compareResult && (
                <ResultItem
                  label={`At ${debounced.compareRate}%`}
                  value={formatCurrency(compareResult.payment, 2)}
                  numericValue={compareResult.payment}
                  formatFn={(n) => formatCurrency(n, 2)}
                />
              )}
              <ResultItem
                label="Total Interest"
                value={formatCurrency(result.totalInterest)}
                numericValue={result.totalInterest}
                formatFn={formatCurrency}
              />
              <ResultItem
                label="Total Cost"
                value={formatCurrency(result.totalCost)}
                numericValue={result.totalCost}
                formatFn={formatCurrency}
              />
              <SmartTips tips={tips} />
              <ShareResultCard
                headline={`${frequencyLabel} mortgage payment`}
                lines={[
                  `Home: ${formatCurrency(debounced.homePrice)}`,
                  `Rate: ${debounced.interestRate}% · ${debounced.amortizationYears} yr`,
                  `Payment: ${formatCurrency(result.payment, 2)}`,
                ]}
              />
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold">Amortization Schedule</h3>
                <div className="max-h-80 overflow-y-auto">
                  <ScrollTable caption="Mortgage amortization schedule">
                    <thead className="sticky top-0 bg-slate-100">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2 text-right">Payment</th>
                        <th className="px-3 py-2 text-right">Principal</th>
                        <th className="px-3 py-2 text-right">Interest</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleSchedule.map((row) => (
                        <tr key={row.paymentNumber} className="border-t border-slate-100">
                          <td className="px-3 py-2">{row.paymentNumber}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.payment, 2)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.principal, 2)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.interest, 2)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </ScrollTable>
                </div>
                {result.schedule.length > 12 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="mt-3 text-sm font-medium text-[#16a34a]"
                  >
                    {showAll ? "Show first 12" : `Show all ${result.schedule.length}`}
                  </button>
                )}
              </div>
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar
        label={`${frequencyLabel} payment`}
        value={formatCurrency(result.payment, 2)}
      />
    </>
  );
}
