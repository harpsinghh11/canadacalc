import type { Metadata } from "next";
import FindInterestRateCalculator from "./FindInterestRateCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Find Interest Rate Calculator",
  description:
    "Work backwards from a savings goal to find the annual return rate you would need. Canadian savings planner.",
  path: "/find-interest-rate",
});

export default function FindInterestRatePage() {
  return <FindInterestRateCalculator />;
}
