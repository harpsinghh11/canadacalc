import type { Metadata } from "next";
import MortgageCalculator from "./MortgageCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Canadian Mortgage Calculator",
  description:
    "Calculate mortgage payments with Canadian semi-annual compounding. Monthly, biweekly, and weekly schedules.",
  path: "/mortgage",
});

export default function MortgagePage() {
  return <MortgageCalculator />;
}
