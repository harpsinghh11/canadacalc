"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { FAQ } from "@/components/ui/FAQ";
import {
  CalculationError,
  evaluateBasicExpression,
  formatCalcDisplay,
} from "@/lib/math/expression";

type HistoryEntry = { expression: string; result: string };

const BUTTON =
  "flex min-h-[52px] items-center justify-center rounded-[var(--radius-control)] text-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] active:scale-[0.98] motion-reduce:active:scale-100";

const OP_BTN =
  `${BUTTON} bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)]`;
const NUM_BTN =
  `${BUTTON} border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]`;
const MEM_BTN =
  `${BUTTON} bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--border)] text-sm`;
const EQ_BTN =
  `${BUTTON} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]`;

export default function BasicCalculator() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [afterEquals, setAfterEquals] = useState(false);

  const append = useCallback((value: string) => {
    setError(null);
    const startingFresh = afterEquals;
    if (startingFresh) setAfterEquals(false);

    setDisplay((prev) => {
      if (startingFresh) {
        if (value === ".") return "0.";
        if (value === "%") return prev;
        return value;
      }
      if (
        value === "." &&
        prev.includes(".") &&
        !/[+\-×÷]/.test(expression.slice(-3))
      ) {
        return prev;
      }
      return prev === "0" && value !== "." ? value : prev + value;
    });
    setExpression((prev) => {
      if (startingFresh) {
        if (value === "%") return prev;
        if (value === ".") return "0.";
        return value;
      }
      return prev + value;
    });
  }, [afterEquals, expression]);

  const clearAll = () => {
    setExpression("");
    setDisplay("0");
    setError(null);
    setAfterEquals(false);
  };

  const clearEntry = () => {
    setDisplay("0");
    setError(null);
    setAfterEquals(false);
    setExpression((prev) => {
      if (/[+\-×÷]$/.test(prev)) return prev;
      const match = prev.match(/^(.*?)([+\-×÷])(-?\d*\.?\d*)$/);
      if (match) return match[1] + match[2];
      return "";
    });
  };

  const backspace = () => {
    setError(null);
    setAfterEquals(false);
    setExpression((prev) => {
      const next = prev.slice(0, -1);
      const match = next.match(/(-?\d+\.?\d*)$/);
      setDisplay(match?.[1] ? match[1] : "0");
      return next;
    });
  };

  const toggleSign = () => {
    setError(null);
    setDisplay((prev) => {
      if (prev === "0") return prev;
      return prev.startsWith("-") ? prev.slice(1) : `-${prev}`;
    });
    setExpression((prev) => {
      if (!prev) return prev;
      const match = prev.match(/(.*?)(-?\d+\.?\d*)$/);
      if (!match) return prev;
      const num = match[2];
      const flipped = num.startsWith("-") ? num.slice(1) : `-${num}`;
      return match[1] + flipped;
    });
  };

  const evaluate = useCallback(() => {
    try {
      const expr = expression || display;
      const result = evaluateBasicExpression(expr);
      const formatted = formatCalcDisplay(result);
      setHistory((h) => [{ expression: expr, result: formatted }, ...h].slice(0, 10));
      setDisplay(formatted);
      setExpression(formatted);
      setError(null);
      setAfterEquals(true);
    } catch (e) {
      const msg = e instanceof CalculationError ? e.message : "Invalid expression";
      setError(msg);
      setDisplay("Error");
    }
  }, [display, expression]);

  const inputOp = useCallback((op: string) => {
    setError(null);
    setAfterEquals(false);
    setExpression((prev) => {
      const base = prev || display;
      if (/[+\-×÷]$/.test(base)) return base.slice(0, -1) + op;
      return `${base}${op}`;
    });
    setDisplay("0");
  }, [display]);

  const inputSqrt = () => {
    setError(null);
    const expr = `sqrt(${expression || display})`;
    setExpression(expr);
    try {
      const result = formatCalcDisplay(evaluateBasicExpression(expr));
      setDisplay(result);
      setAfterEquals(true);
    } catch (e) {
      const msg = e instanceof CalculationError ? e.message : "Invalid expression";
      setError(msg);
    }
  };

  const memoryOp = (op: "MC" | "MR" | "M+" | "M-") => {
    const current = Number(display) || 0;
    if (op === "MC") setMemory(0);
    if (op === "MR") {
      setDisplay(formatCalcDisplay(memory));
      setExpression(String(memory));
      setAfterEquals(true);
    }
    if (op === "M+") setMemory((m) => m + current);
    if (op === "M-") setMemory((m) => m - current);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.closest('[role="combobox"]'))
      ) {
        return;
      }
      if (e.key >= "0" && e.key <= "9") append(e.key);
      else if (e.key === ".") append(".");
      else if (e.key === "+") inputOp("+");
      else if (e.key === "-") inputOp("-");
      else if (e.key === "*") inputOp("×");
      else if (e.key === "/") {
        e.preventDefault();
        inputOp("÷");
      }
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        evaluate();
      }
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearAll();
      else if (e.key === "%") append("%");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [append, evaluate, inputOp]);

  return (
    <CalculatorLayout
      title="Online Calculator"
      badge={<LastUpdated>Calculations run in your browser</LastUpdated>}
      description="A fast, simple calculator for everyday math. No signup required."
      footer={
        <>
          <section className="mt-8 space-y-3 text-sm text-slate-600">
            <h2 className="text-base font-semibold text-[#0f172a]">
              How to use this calculator
            </h2>
            <p>
              Tap buttons or use your keyboard to enter numbers and operators.
              Press <strong>=</strong> or <strong>Enter</strong> to calculate.
              Memory buttons store a value for later (MC clear, MR recall, M+
              add, M− subtract).
            </p>
            <h2 className="text-base font-semibold text-[#0f172a]">
              Keyboard shortcuts
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Enter / =</strong> — calculate</li>
              <li><strong>Backspace</strong> — delete last digit</li>
              <li><strong>Escape</strong> — clear all</li>
              <li><strong>+ − × ÷</strong> — operators</li>
            </ul>
          </section>
          <FAQ
            items={[
              {
                q: "Is my data stored?",
                a: "No. All math runs locally in your browser. Nothing is sent to a server.",
              },
              {
                q: "How does the % button work?",
                a: "For expressions like 200+10%, the percentage is calculated on the preceding amount (200 + 20 = 220).",
              },
              {
                q: "Can I use decimals and negatives?",
                a: "Yes. Use the decimal point and ± button to toggle the sign of the current entry.",
              },
            ]}
          />
        </>
      }
    >
      <div className="mx-auto max-w-md">
        <p className="mb-4 text-center text-sm text-slate-600">
          Need trig, logs, or powers?{" "}
          <Link
            href="/scientific-calculator"
            className="font-medium text-[var(--brand)] hover:underline"
          >
            Open scientific calculator →
          </Link>
        </p>
        <div
          className="mb-4 rounded-[var(--radius-surface)] bg-[var(--navy)] px-4 py-5 text-right"
          aria-live="polite"
          aria-label="Calculator display"
        >
          {expression && expression !== display && (
            <p className="truncate text-sm text-slate-400">{expression}</p>
          )}
          <p className="truncate text-4xl font-semibold tabular-nums text-white">
            {display}
          </p>
          {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(["MC", "MR", "M+", "M-"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-label={m}
              className={MEM_BTN}
              onClick={() => memoryOp(m)}
            >
              {m}
            </button>
          ))}
          <button type="button" aria-label="Clear all" className={`${BUTTON} bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-strong)]`} onClick={clearAll}>AC</button>
          <button type="button" aria-label="Clear entry" className={`${BUTTON} bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-strong)]`} onClick={clearEntry}>CE</button>
          <button type="button" aria-label="Backspace" className={`${BUTTON} bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-strong)]`} onClick={backspace}>⌫</button>
          <button type="button" aria-label="Divide" className={OP_BTN} onClick={() => inputOp("÷")}>÷</button>

          {["7", "8", "9"].map((d) => (
            <button key={d} type="button" className={NUM_BTN} onClick={() => append(d)}>{d}</button>
          ))}
          <button type="button" aria-label="Multiply" className={OP_BTN} onClick={() => inputOp("×")}>×</button>

          {["4", "5", "6"].map((d) => (
            <button key={d} type="button" className={NUM_BTN} onClick={() => append(d)}>{d}</button>
          ))}
          <button type="button" aria-label="Subtract" className={OP_BTN} onClick={() => inputOp("-")}>−</button>

          {["1", "2", "3"].map((d) => (
            <button key={d} type="button" className={NUM_BTN} onClick={() => append(d)}>{d}</button>
          ))}
          <button type="button" aria-label="Add" className={OP_BTN} onClick={() => inputOp("+")}>+</button>

          <button type="button" className={NUM_BTN} onClick={toggleSign}>±</button>
          <button type="button" className={NUM_BTN} onClick={() => append("0")}>0</button>
          <button type="button" className={NUM_BTN} onClick={() => append(".")}>.</button>
          <button type="button" aria-label="Equals" className={EQ_BTN} onClick={evaluate}>=</button>

          <button type="button" className={`${MEM_BTN} col-span-2`} onClick={() => append("%")}>%</button>
          <button type="button" className={`${MEM_BTN} col-span-2`} onClick={inputSqrt}>√</button>
        </div>

        {history.length > 0 && (
          <details className="mt-6 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
              History ({history.length})
            </summary>
            <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
              {history.map((h, i) => (
                <li key={`${h.expression}-${i}`} className="tabular-nums">
                  {h.expression} = <strong>{h.result}</strong>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </CalculatorLayout>
  );
}
