"use client";

import { useCallback, useState } from "react";
import { inputClassName } from "@/components/CalculatorLayout";

function parseNumericInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

interface NumericInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function NumericInput({
  id,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  decimals = 0,
}: NumericInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const safeValue = Number.isFinite(value) ? value : 0;

  const displayValue = focused
    ? draft
    : safeValue.toLocaleString("en-CA", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  const commit = useCallback(
    (raw: string) => {
      let n = parseNumericInput(raw);
      if (min !== undefined) n = Math.max(min, n);
      if (max !== undefined) n = Math.min(max, n);
      onChange(n);
    },
    [min, max, onChange],
  );

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        step={step}
        onFocus={() => {
          setFocused(true);
          setDraft(String(safeValue));
        }}
        onBlur={() => {
          commit(draft);
          setFocused(false);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
        }}
        className={`${inputClassName} min-h-[44px] ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function CurrencyInput(
  props: Omit<NumericInputProps, "prefix" | "suffix" | "decimals">,
) {
  return <NumericInput {...props} prefix="$" decimals={0} />;
}

export function PercentInput(
  props: Omit<NumericInputProps, "prefix" | "suffix" | "decimals">,
) {
  return <NumericInput {...props} suffix="%" decimals={2} />;
}

export function NumberInput(props: Omit<NumericInputProps, "prefix" | "suffix">) {
  return <NumericInput {...props} />;
}
