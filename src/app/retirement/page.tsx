import type { Metadata } from "next";
import RetirementCalculator from "./RetirementCalculator";

export const metadata: Metadata = {
  title: "Retirement Calculator",
  description:
    "Plan your retirement savings and estimate how long your nest egg will last based on your expected expenses.",
};

export default function RetirementPage() {
  return <RetirementCalculator />;
}
