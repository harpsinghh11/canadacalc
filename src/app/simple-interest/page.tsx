import type { Metadata } from "next";
import SimpleInterestCalculator from "./SimpleInterestCalculator";

export const metadata: Metadata = {
  title: "Simple Interest Calculator — Free & Instant | CanadaCalc",
  description:
    "Calculate simple interest on savings, loans, or investments. Free, instant, no signup required.",
};

export default function SimpleInterestPage() {
  return <SimpleInterestCalculator />;
}
