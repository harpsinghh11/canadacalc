import type { Metadata } from "next";
import SimpleInterestCalculator from "./SimpleInterestCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Simple Interest Calculator",
  description:
    "Calculate simple interest on savings or loans with contributions and a clear year-by-year table.",
  path: "/simple-interest",
});

export default function SimpleInterestPage() {
  return <SimpleInterestCalculator />;
}
