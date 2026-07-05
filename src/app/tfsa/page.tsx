import type { Metadata } from "next";
import TfsaCalculator from "./TfsaCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "TFSA Calculator — Growth & Contribution Room",
  description:
    "Project your Tax-Free Savings Account to age 65 with CRA contribution limits explained. Free Canadian TFSA calculator.",
  path: "/tfsa",
});

export default function TfsaPage() {
  return <TfsaCalculator />;
}
