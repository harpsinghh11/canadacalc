import type { Metadata } from "next";
import FhsaCalculator from "./FhsaCalculator";

export const metadata: Metadata = {
  title: "FHSA Calculator",
  description:
    "Plan your First Home Savings Account with 2025 CRA limits, tax-deductible contributions, and tax-free growth toward your first home.",
};

export default function FhsaPage() {
  return <FhsaCalculator />;
}
