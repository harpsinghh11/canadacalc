import type { Metadata } from "next";
import StockLookbackCalculator from "./StockLookbackCalculator";

export const metadata: Metadata = {
  title: "Stock Lookback Tool",
  description:
    "See what your stock investment would be worth today if you bought shares on a past date. Powered by historical market data.",
};

export default function StockLookbackPage() {
  return <StockLookbackCalculator />;
}
