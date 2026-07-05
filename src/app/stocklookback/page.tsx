import type { Metadata } from "next";
import StockLookbackCalculator from "./StockLookbackCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Stock Lookback Calculator",
  description:
    "See what a past stock purchase would be worth today, compared to the S&P 500. Free investment lookback tool.",
  path: "/stocklookback",
});

export default function StockLookbackPage() {
  return <StockLookbackCalculator />;
}
