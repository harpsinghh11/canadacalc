/** Shared Recharts styling — import everywhere instead of ad-hoc colors. */
export const CHART_COLORS = {
  /** Neutral primary series (growth projections, balances). */
  primary: "#0f172a",
  secondary: "#64748b",
  compare: "#475569",
  grid: "#e4e4e7",
  gapFill: "#0f172a",
  /** Positive performance (e.g. stock gains). */
  positive: "#15803d",
  positiveFill: "#15803d",
  negative: "#dc2626",
  negativeFill: "#dc2626",
  benchmark: "#2563eb",
} as const;

export const CHART_FONT_SIZE = 12;

export const CHART_MARGINS = {
  top: 8,
  right: 16,
  left: 70,
  bottom: 28,
} as const;

export const chartAxisStyle = {
  fontSize: CHART_FONT_SIZE,
  fill: "#64748b",
};

export const chartLegendStyle = {
  fontSize: CHART_FONT_SIZE,
};

export const chartTooltipStyle = {
  fontSize: CHART_FONT_SIZE,
};

export function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
}
