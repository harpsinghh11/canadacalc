import BasicCalculator from "./BasicCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Free Online Calculator",
  description:
    "A fast, simple calculator for everyday math. Addition, subtraction, multiplication, division, percentages, and more — no signup required.",
  path: "/calculator",
});

export default function CalculatorPage() {
  return <BasicCalculator />;
}
