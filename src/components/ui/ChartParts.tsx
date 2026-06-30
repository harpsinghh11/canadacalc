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
  options?: { withLegend?: boolean; withReferenceLabel?: boolean },
) {
  return {
    top: options?.withReferenceLabel ? 28 : 8,
    right: 8,
    left: isMobile ? 4 : 12,
    bottom: options?.withLegend ? (isMobile ? 40 : 48) : isMobile ? 28 : 24,
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

/** Label above a horizontal reference line — left-aligned to avoid x-axis date overlap. */
export function ReferenceInvestmentLabel({
  viewBox,
}: {
  viewBox?: { x?: number; y?: number; width?: number };
}) {
  if (
    viewBox?.x == null ||
    viewBox.y == null ||
    viewBox.width == null
  ) {
    return null;
  }

  return (
    <text
      x={viewBox.x + 8}
      y={viewBox.y - 10}
      textAnchor="start"
      fill={CHART_COLORS.secondary}
      fontSize={12}
    >
      Original investment
    </text>
  );
}

export function getDateXAxisProps(isMobile: boolean, pointCount: number) {
  return {
    tick: chartAxisStyle,
    tickMargin: 8,
    label: undefined,
    interval: pointCount <= 12 ? (0 as const) : ("preserveStartEnd" as const),
    minTickGap: isMobile ? 24 : pointCount <= 12 ? 8 : 16,
    tickFormatter: (value: string) => {
      const d = new Date(value + "T12:00:00");
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString("en-CA", {
        month: "short",
        year: pointCount > 24 ? "2-digit" : undefined,
        day: pointCount <= 24 ? "numeric" : undefined,
      });
    },
  };
}

export function ChartPortfolioComparisonTooltip({
  active,
  payload,
  label,
  stockLabel,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[];
  label?: string | number;
  stockLabel: string;
}): ReactElement | null {
  if (!active || !payload?.length || !label) return null;

  const dateLabel =
    typeof label === "string"
      ? new Date(label + "T12:00:00").toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : label;

  const visible = payload.filter(
    (entry) =>
      entry.value !== undefined &&
      entry.value !== null &&
      (entry.dataKey === "value" || entry.dataKey === "spyValue"),
  );

  const stockEntry =
    visible.find((entry) => entry.dataKey === "value") ?? visible[0];
  const spyEntry = visible.find((entry) => entry.dataKey === "spyValue");

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md"
      style={chartTooltipStyle}
    >
      <p className="mb-1 font-medium text-slate-700">{dateLabel}</p>
      {stockEntry && (
        <p style={{ color: stockEntry.color }}>
          {stockLabel}: {formatCurrency(Number(stockEntry.value))}
        </p>
      )}
      {spyEntry && (
        <p style={{ color: spyEntry.color }}>
          S&amp;P 500 (SPY): {formatCurrency(Number(spyEntry.value))}
        </p>
      )}
    </div>
  );
}
