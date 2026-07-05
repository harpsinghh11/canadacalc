import type { Metadata } from "next";
import RetirementCalculator from "./RetirementCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Retirement Savings Calculator",
  description:
    "Estimate retirement savings at your target age and how long your nest egg may last using the 4% rule.",
  path: "/retirement",
});

export default function RetirementPage() {
  return <RetirementCalculator />;
}
