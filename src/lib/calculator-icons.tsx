import {
  Calculator,
  ChartNoAxesCombined,
  FunctionSquare,
  House,
  Landmark,
  PiggyBank,
  ReceiptText,
  Sigma,
  Target,
  TrendingUp,
  Umbrella,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "/calculator": Calculator,
  "/scientific-calculator": Sigma,
  "/tax": ReceiptText,
  "/tax/ontario": Landmark,
  "/tax/british-columbia": Landmark,
  "/tax/alberta": Landmark,
  "/tax/quebec": Landmark,
  "/tfsa": PiggyBank,
  "/fhsa": WalletCards,
  "/compound": TrendingUp,
  "/simple-interest": Target,
  "/find-interest-rate": Target,
  "/mortgage": House,
  "/retirement": Umbrella,
  "/stocklookback": ChartNoAxesCombined,
};

export function getCalculatorIcon(href: string): LucideIcon {
  return ICON_MAP[href] ?? Calculator;
}

export function CalculatorIcon({
  href,
  className = "h-5 w-5",
}: {
  href: string;
  className?: string;
}) {
  const Icon = ICON_MAP[href] ?? Calculator;
  return <Icon className={className} aria-hidden />;
}

export { FunctionSquare };
