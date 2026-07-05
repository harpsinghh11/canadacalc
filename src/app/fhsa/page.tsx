import type { Metadata } from "next";
import FhsaCalculator from "./FhsaCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "FHSA Calculator — First Home Savings Account",
  description:
    "Plan FHSA contributions, tax refunds, and growth toward your first home. Canadian first-time buyer calculator.",
  path: "/fhsa",
});

export default function FhsaPage() {
  return <FhsaCalculator />;
}
