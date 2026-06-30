import type { Metadata } from "next";
import CompoundCalculator from "./CompoundCalculator";

export const metadata: Metadata = {
  title: "Compound Interest Calculator",
  description:
    "Calculate compound interest with monthly or biweekly contributions, and see exactly how much more you earn vs simple interest. Free Canadian calculator updated for 2025.",
};

export default function CompoundPage() {
  return <CompoundCalculator />;
}
