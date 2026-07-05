import ScientificCalculator from "./ScientificCalculator";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Scientific Calculator Online",
  description:
    "A free online scientific calculator for advanced math, trigonometry, logarithms, powers, and more. DEG and RAD modes supported.",
  path: "/scientific-calculator",
});

export default function ScientificCalculatorPage() {
  return <ScientificCalculator />;
}
