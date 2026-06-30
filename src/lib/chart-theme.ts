/** Shared Recharts styling — import everywhere instead of ad-hoc colors. */
export const CHART_COLORS = {
  primary: "#16a34a",
  secondary: "#64748b",
  compare: "#0f172a",
  grid: "#e2e8f0",
  gapFill: "#16a34a",
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
