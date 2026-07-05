import type { Metadata } from "next";
import TaxCalculator from "./TaxCalculator";
import { ProvinceTaxNavLinks } from "@/components/tax/ProvinceTaxNavLinks";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Canada Tax Calculator 2026",
  description:
    "Estimate Canadian income tax, provincial tax, CPP, EI, and after-tax income with our free Canada tax calculator. Plain-English breakdown for all provinces and territories.",
  path: "/tax",
});

export default function TaxPage() {
  return (
    <TaxCalculator
      title="Canadian Income Tax Calculator"
      description="Estimate annual Canadian income tax, provincial tax, CPP or QPP, EI, and after-tax income — with plain-English explanations for every province and territory."
      supplementalContent={
        <>
          <p className="mb-6 text-sm text-slate-600">
            Use this free <strong>Canada tax calculator</strong> to estimate
            annual salary tax, income tax, and after-tax income across Canada.
            This is an <strong>annual tax estimator</strong> — not payroll
            withholding. Enter employment income and deductions to see federal and
            provincial tax, CPP or QPP, and EI in one place.
          </p>
          <ProvinceTaxNavLinks />
        </>
      }
    />
  );
}
