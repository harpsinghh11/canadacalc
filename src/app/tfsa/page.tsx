import type { Metadata } from "next";
import TfsaCalculator from "./TfsaCalculator";

export const metadata: Metadata = {
  title: "TFSA Calculator",
  description:
    "Project your Tax-Free Savings Account growth to retirement using 2025 CRA contribution limits and cumulative room since 2009.",
};

export default function TfsaPage() {
  return <TfsaCalculator />;
}
