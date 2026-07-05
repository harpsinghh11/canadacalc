"use client";

import Link from "next/link";
import { Delete } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { FAQ } from "@/components/ui/FAQ";
import {
  CalculationError,
  evaluateExpression,
  formatCalcDisplay,
} from "@/lib/math/expression";

type AngleMode = "deg" | "rad";
type HistoryEntry = { expression: string; result: string };

type SciKey = {
  label: ReactNode;
  action: string;
  ariaLabel?: string;
};

const BTN =
  "flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] px-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand)] active:scale-[0.98] motion-reduce:active:scale-100 sm:min-h-[48px]";

const SCI_BTN = `${BTN} bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)] text-xs sm:text-sm`;
const NUM_BTN = `${BTN} border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-base sm:text-lg`;
const OP_BTN = `${BTN} bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)] text-lg font-semibold`;
const EQ_BTN = `${BTN} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] text-xl font-semibold`;
const CLR_BTN = `${BTN} bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-strong)]`;

const INV = ({ fn }: { fn: string }) => (
  <>
    {fn}
    <sup className="ml-px text-[0.65em] font-semibold leading-none">−1</sup>
  </>
);

/** Visible labels only — actions map to the same parser tokens as before. */
const SCI_KEYS: SciKey[] = [
  { label: "sin", action: "func:sin" },
  { label: "cos", action: "func:cos" },
  { label: "tan", action: "func:tan" },
  { label: <INV fn="sin" />, action: "func:asin", ariaLabel: "inverse sine" },
  { label: <INV fn="cos" />, action: "func:acos", ariaLabel: "inverse cosine" },
  { label: <INV fn="tan" />, action: "func:atan", ariaLabel: "inverse tangent" },
  { label: "log", action: "func:log" },
  { label: "ln", action: "func:ln" },
  { label: "x²", action: "pow:2", ariaLabel: "x squared" },
  { label: "x³", action: "pow:3", ariaLabel: "x cubed" },
  { label: "xʸ", action: "op:^", ariaLabel: "x to the power of y" },
  { label: "√x", action: "func:sqrt", ariaLabel: "square root" },
  { label: "∛x", action: "func:cbrt", ariaLabel: "cube root" },
  { label: "1/x", action: "pow:-1", ariaLabel: "reciprocal" },
  { label: "n!", action: "suffix:!", ariaLabel: "factorial" },
  { label: "|x|", action: "func:abs", ariaLabel: "absolute value" },
  { label: "π", action: "const:π", ariaLabel: "pi" },
  { label: "e", action: "const:e", ariaLabel: "Euler's number" },
];

export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [mode, setMode] = useState<AngleMode>("deg");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  /** After =, the next digit starts a new expression; operators continue from the result. */
  const [afterEquals, setAfterEquals] = useState(false);

  const display = expression || "0";

  const appendToExpression = useCallback(
    (chunk: string, opts?: { replaceAll?: boolean }) => {
      setError(null);
      setExpression((ex) => {
        if (opts?.replaceAll || afterEquals) {
          setAfterEquals(false);
          return chunk;
        }
        if (!ex) return chunk;
        return ex + chunk;
      });
    },
    [afterEquals],
  );

  const appendDigit = useCallback(
    (digit: string) => {
      setError(null);
      setExpression((ex) => {
        if (afterEquals) {
          setAfterEquals(false);
          return digit === "." ? "0." : digit;
        }
        if (!ex) return digit === "." ? "0." : digit;
        if (ex === "0" && digit !== ".") return digit;
        if (digit === "." && /\d$/.test(ex) && ex.split(/[+\-*/^%]/).pop()?.includes(".")) {
          return ex;
        }
        return ex + digit;
      });
    },
    [afterEquals],
  );

  const appendOperator = useCallback(
    (op: string) => {
      setError(null);
      setAfterEquals(false);
      setExpression((ex) => {
        const base = ex || "0";
        if (/[+\-*/^%]$/.test(base)) return base.slice(0, -1) + op;
        return base + op;
      });
    },
    [],
  );

  const appendFunction = useCallback(
    (fn: string) => {
      setError(null);
      setExpression((ex) => {
        if (afterEquals) {
          setAfterEquals(false);
          return `${fn}(`;
        }
        if (!ex) return `${fn}(`;
        if (/[\d)πe!]$/.test(ex)) return `${ex}*${fn}(`;
        return ex + `${fn}(`;
      });
    },
    [afterEquals],
  );

  const appendConstant = useCallback(
    (name: string) => {
      setError(null);
      setExpression((ex) => {
        if (afterEquals) {
          setAfterEquals(false);
          return name;
        }
        if (!ex) return name;
        if (/[\d)πe!]$/.test(ex)) return `${ex}*${name}`;
        return ex + name;
      });
    },
    [afterEquals],
  );

  const appendPower = useCallback(
    (exp: string) => {
      setError(null);
      setAfterEquals(false);
      setExpression((ex) => {
        const base = ex || "0";
        if (exp === "-1") return `(${base})^(-1)`;
        return `${base}^${exp}`;
      });
    },
    [],
  );

  const appendSuffix = useCallback(
    (suffix: string) => {
      setError(null);
      setAfterEquals(false);
      setExpression((ex) => {
        const base = ex || "0";
        return base + suffix;
      });
    },
    [],
  );

  const handleSciKey = useCallback(
    (action: string) => {
      const [kind, value] = action.split(":");
      if (kind === "func") appendFunction(value);
      else if (kind === "const") appendConstant(value);
      else if (kind === "op") appendOperator(value);
      else if (kind === "pow") appendPower(value);
      else if (kind === "suffix") appendSuffix(value);
    },
    [appendConstant, appendFunction, appendOperator, appendPower, appendSuffix],
  );

  const clearAll = useCallback(() => {
    setExpression("");
    setError(null);
    setAfterEquals(false);
  }, []);

  const backspace = useCallback(() => {
    setError(null);
    setAfterEquals(false);
    setExpression((ex) => ex.slice(0, -1));
  }, []);

  const evaluate = useCallback(() => {
    try {
      const expr = expression.trim();
      if (!expr) throw new CalculationError("Enter an expression");
      const result = evaluateExpression(expr, mode);
      const formatted = formatCalcDisplay(result);
      setHistory((h) =>
        [{ expression: expr, result: formatted }, ...h].slice(0, 10),
      );
      setExpression(formatted);
      setAfterEquals(true);
      setError(null);
    } catch (e) {
      const msg =
        e instanceof CalculationError ? e.message : "Invalid expression";
      setError(msg);
    }
  }, [expression, mode]);

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
      if (e.key >= "0" && e.key <= "9") appendDigit(e.key);
      else if (e.key === ".") appendDigit(".");
      else if (e.key === "(" || e.key === ")") appendToExpression(e.key);
      else if (e.key === "+") appendOperator("+");
      else if (e.key === "-") appendOperator("-");
      else if (e.key === "*") appendOperator("*");
      else if (e.key === "/") {
        e.preventDefault();
        appendOperator("/");
      } else if (e.key === "^") appendOperator("^");
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        evaluate();
      } else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    appendDigit,
    appendOperator,
    appendToExpression,
    backspace,
    clearAll,
    evaluate,
  ]);

  return (
    <CalculatorLayout
      title="Scientific Calculator"
      badge={<LastUpdated>Calculations run in your browser</LastUpdated>}
      description="A free online scientific calculator for advanced math, trigonometry, logarithms, powers, and more."
      footer={
        <>
          <p className="mb-6 text-center text-sm text-slate-600">
            Need something simpler?{" "}
            <Link
              href="/calculator"
              className="font-medium text-[var(--brand)] hover:underline"
            >
              Basic online calculator →
            </Link>
          </p>
          <section className="mt-4 space-y-3 text-sm text-slate-600">
            <h2 className="text-base font-semibold text-[#0f172a]">
              Angle mode
            </h2>
            <p>
              Trigonometry uses <strong>{mode.toUpperCase()}</strong>{" "}
              {mode === "deg" ? "(degrees)" : "(radians)"}. Switch with the DEG
              / RAD buttons above the keypad.
            </p>
          </section>
          <FAQ
            items={[
              {
                q: "What does the % button do?",
                a: "It calculates the remainder (modulo), not a percentage. For everyday percentage math, use the basic online calculator.",
              },
              {
                q: "What happens if I take log of zero?",
                a: "The calculator shows a clear error — logarithms require a positive number.",
              },
              {
                q: "Does this use eval()?",
                a: "No. Expressions are parsed and evaluated safely in your browser without running arbitrary code.",
              },
              {
                q: "Can I use keyboard input?",
                a: "Yes. Numbers, operators, parentheses, Enter to calculate, and Escape to clear.",
              },
            ]}
          />
        </>
      }
    >
      <div className="mx-auto max-w-2xl min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={mode === "deg"}
            aria-label="Degrees mode"
            className={`rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${
              mode === "deg"
                ? "bg-[var(--brand)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
            onClick={() => setMode("deg")}
          >
            DEG
          </button>
          <button
            type="button"
            aria-pressed={mode === "rad"}
            aria-label="Radians mode"
            className={`rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${
              mode === "rad"
                ? "bg-[var(--brand)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
            onClick={() => setMode("rad")}
          >
            RAD
          </button>
        </div>

        <div
          className="mb-4 rounded-[var(--radius-surface)] bg-[var(--navy)] px-4 py-5 text-right"
          aria-live="polite"
          aria-label="Calculator display"
        >
          <p className="truncate text-3xl font-semibold tabular-nums text-white sm:text-4xl">
            {display}
          </p>
          {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
        </div>

        <section aria-label="Scientific functions">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {SCI_KEYS.map(({ label, action, ariaLabel }) => (
              <button
                key={action}
                type="button"
                className={SCI_BTN}
                aria-label={ariaLabel}
                onClick={() => handleSciKey(action)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section
          aria-label="Calculator keypad"
          className="mt-4 border-t border-[var(--border)] pt-4"
        >
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <button type="button" className={CLR_BTN} onClick={clearAll} aria-label="Clear all">
              AC
            </button>
            <button
              type="button"
              className={CLR_BTN}
              onClick={backspace}
              aria-label="Backspace"
            >
              <Delete className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" aria-hidden />
            </button>
            <button type="button" className={CLR_BTN} onClick={() => appendToExpression("(")} aria-label="Open parenthesis">
              (
            </button>
            <button type="button" className={CLR_BTN} onClick={() => appendToExpression(")")} aria-label="Close parenthesis">
              )
            </button>

            {["7", "8", "9"].map((d) => (
              <button key={d} type="button" className={NUM_BTN} onClick={() => appendDigit(d)}>
                {d}
              </button>
            ))}
            <button type="button" className={OP_BTN} onClick={() => appendOperator("/")} aria-label="Divide">
              ÷
            </button>

            {["4", "5", "6"].map((d) => (
              <button key={d} type="button" className={NUM_BTN} onClick={() => appendDigit(d)}>
                {d}
              </button>
            ))}
            <button type="button" className={OP_BTN} onClick={() => appendOperator("*")} aria-label="Multiply">
              ×
            </button>

            {["1", "2", "3"].map((d) => (
              <button key={d} type="button" className={NUM_BTN} onClick={() => appendDigit(d)}>
                {d}
              </button>
            ))}
            <button type="button" className={OP_BTN} onClick={() => appendOperator("-")} aria-label="Subtract">
              −
            </button>

            <button type="button" className={NUM_BTN} onClick={() => appendDigit("0")}>
              0
            </button>
            <button type="button" className={NUM_BTN} onClick={() => appendDigit(".")} aria-label="Decimal point">
              .
            </button>
            <button type="button" className={OP_BTN} onClick={() => appendOperator("%")} aria-label="Modulo (remainder)" title="Modulo (remainder)">
              mod
            </button>
            <button type="button" className={OP_BTN} onClick={() => appendOperator("+")} aria-label="Add">
              +
            </button>
          </div>

          <button
            type="button"
            className={`${EQ_BTN} mt-2 w-full min-h-[52px] sm:min-h-[56px]`}
            onClick={evaluate}
            aria-label="Equals"
          >
            =
          </button>
        </section>

        {history.length > 0 && (
          <details className="mt-6 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
              History ({history.length})
            </summary>
            <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
              {history.map((h, i) => (
                <li
                  key={`${h.expression}-${i}`}
                  className="break-all tabular-nums"
                >
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
