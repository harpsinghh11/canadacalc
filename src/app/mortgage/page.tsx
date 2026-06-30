import type { Metadata } from "next";
import MortgageCalculator from "./MortgageCalculator";

export const metadata: Metadata = {
  title: "Mortgage Calculator",
  description:
    "Calculate Canadian mortgage payments with semi-annual compounding. Compare monthly, biweekly, and weekly payment frequencies.",
};

export default function MortgagePage() {
  return <MortgageCalculator />;
}
