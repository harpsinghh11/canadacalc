import type { Metadata } from "next";
import TaxCalculator from "./TaxCalculator";

export const metadata: Metadata = {
  title: "Canadian Income Tax Calculator",
  description:
    "Estimate your 2025 federal and provincial income tax, CPP, and EI deductions for all 10 Canadian provinces.",
};

export default function TaxPage() {
  return <TaxCalculator />;
}
