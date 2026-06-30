"use client";

import type { ReactElement } from "react";
import {
  CHART_COLORS,
  CHART_MARGINS,
  chartAxisStyle,
  chartLegendStyle,
  chartTooltipStyle,
  formatAxisCurrency,
} from "@/lib/chart-theme";
import { formatCurrency } from "@/lib/format";

export { CHART_COLORS, CHART_MARGINS };

export const balanceYAxisProps = {
  tickFormatter: formatAxisCurrency,
  tick: chartAxisStyle,
  width: 60,
  label: {
    value: "Balance ($)",
    angle: -90,
    position: "insideLeft" as const,
    offset: -10,
    style: { ...chartAxisStyle, textAnchor: "middle" as const },
  },
};

export const yearXAxisProps = {
  tick: chartAxisStyle,
  label: {
    value: "Year",
    position: "insideBottom" as const,
    offset: -5,
    style: chartAxisStyle,
  },
};

export const chartLegendProps = {
  wrapperStyle: chartLegendStyle,
  iconType: "plainline" as const,
  iconSize: 16,
};

/** Legend sits below x-axis ticks — extra bottom margin avoids overlap. */
export const comparisonLegendProps = {
  ...chartLegendProps,
  verticalAlign: "bottom" as const,
  wrapperStyle: {
    ...chartLegendStyle,
    paddingTop: 16,
  },
};

export function getChartMargins(
  isMobile: boolean,
  options?: { withLegend?: boolean },
) {
  return {
    top: 8,
    right: 8,
    left: isMobile ? 4 : 12,
    bottom: options?.withLegend ? (isMobile ? 40 : 48) : isMobile ? 24 : 20,
  };
}

export function getBalanceYAxisProps(isMobile: boolean) {
  if (isMobile) {
    return { ...balanceYAxisProps, width: 48, label: undefined };
  }
  return {
    ...balanceYAxisProps,
    width: 52,
    label: undefined,
  };
}

export function getYearXAxisProps(isMobile: boolean, totalYears: number) {
  const showEveryTick = totalYears <= 12;
  return {
    ...yearXAxisProps,
    label: undefined,
    tickMargin: 8,
    interval: showEveryTick
      ? (0 as const)
      : ("preserveStartEnd" as const),
    minTickGap: isMobile ? 28 : showEveryTick ? 8 : 20,
  };
}

export function ChartCurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string | number;
}): ReactElement | null {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md"
      style={chartTooltipStyle}
    >
      <p className="mb-1 font-medium text-slate-700">Year {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(Number(entry.value))}
        </p>
      ))}
    </div>
  );
}

export const chartGridProps = {
  strokeDasharray: "3 3",
  stroke: CHART_COLORS.grid,
};
