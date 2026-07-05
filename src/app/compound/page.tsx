import type { Metadata } from "next";
import CompoundCalculator from "./CompoundCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Compound Interest Calculator",
  description:
    "See how compound interest grows savings over time. Compare compound vs simple interest with year-by-year breakdown.",
  path: "/compound",
});

export default function CompoundPage() {
  return <CompoundCalculator />;
}
