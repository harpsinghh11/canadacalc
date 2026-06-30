import type { Metadata } from "next";
import FindInterestRateCalculator from "./FindInterestRateCalculator";

export const metadata: Metadata = {
  title: "Find Interest Rate Calculator",
  description:
    "Work backwards from your savings goal to calculate the annual interest rate you need with compound growth and contributions.",
};

export default function FindInterestRatePage() {
  return <FindInterestRateCalculator />;
}
