/** Round to avoid floating-point display noise (e.g. 0.30000000000000004). */
export function roundResult(value: number, decimals = 10): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export class CalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculationError";
  }
}

type AngleMode = "deg" | "rad";

function toRadians(value: number, mode: AngleMode): number {
  return mode === "deg" ? (value * Math.PI) / 180 : value;
}

function fromRadians(value: number, mode: AngleMode): number {
  return mode === "deg" ? (value * 180) / Math.PI : value;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new CalculationError("Factorial requires a non-negative integer");
  }
  if (n > 170) {
    throw new CalculationError("Number too large for factorial");
  }
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<
  string,
  (args: number[], mode: AngleMode) => number
> = {
  sin: ([x], mode) => Math.sin(toRadians(x, mode)),
  cos: ([x], mode) => Math.cos(toRadians(x, mode)),
  tan: ([x], mode) => Math.tan(toRadians(x, mode)),
  asin: ([x], mode) => fromRadians(Math.asin(x), mode),
  acos: ([x], mode) => fromRadians(Math.acos(x), mode),
  atan: ([x], mode) => fromRadians(Math.atan(x), mode),
  log: ([x]) => {
    if (x <= 0) throw new CalculationError("Log requires a positive number");
    return Math.log10(x);
  },
  ln: ([x]) => {
    if (x <= 0) throw new CalculationError("Ln requires a positive number");
    return Math.log(x);
  },
  sqrt: ([x]) => {
    if (x < 0) throw new CalculationError("Square root of negative number");
    return Math.sqrt(x);
  },
  cbrt: ([x]) => {
    if (x < 0) return -Math.pow(-x, 1 / 3);
    return Math.cbrt(x);
  },
  abs: ([x]) => Math.abs(x),
  fact: ([x]) => factorial(x),
};

type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" }
  | { type: "ident"; value: string };

/** Insert implicit × and normalize symbols before tokenizing. */
export function normalizeScientificExpression(expression: string): string {
  let s = expression
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");

  // Protect scientific-notation exponents (e.g. 1.5e-3) from implicit-multiply rules.
  const sci: string[] = [];
  s = s.replace(/\d(?:\.\d+)?[eE][+-]?\d+/g, (match) => {
    sci.push(match);
    return `\x00${sci.length - 1}\x00`;
  });

  // 2π, 3sin(, )(4, )π
  s = s.replace(/(\d)([a-zπ(])/gi, "$1*$2");
  s = s.replace(/(\))(\d|[a-zπ(])/gi, "$1*$2");
  s = s.replace(/([πe])(\d)/gi, "$1*$2");
  s = s.replace(/(\d)([πe])/gi, "$1*$2");

  s = s.replace(/\x00(\d+)\x00/g, (_, i) => sci[Number(i)]);

  return s;
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = expression;

  while (i < src.length) {
    const ch = src[i];

    if (/[0-9.]/.test(ch)) {
      let num = ch;
      i += 1;
      while (i < src.length && /[0-9.]/.test(src[i])) {
        num += src[i];
        i += 1;
      }
      if (i < src.length && (src[i] === "e" || src[i] === "E")) {
        const next = src[i + 1];
        if (next && /[+-]?\d/.test(src.slice(i + 1))) {
          num += src[i];
          i += 1;
          if (src[i] === "+" || src[i] === "-") {
            num += src[i];
            i += 1;
          }
          while (i < src.length && /\d/.test(src[i])) {
            num += src[i];
            i += 1;
          }
        }
      }
      const value = Number(num);
      if (Number.isNaN(value)) {
        throw new CalculationError("Invalid number");
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (/[a-zπ]/i.test(ch)) {
      let ident = ch;
      i += 1;
      while (i < src.length && /[a-z0-9]/i.test(src[i])) {
        ident += src[i];
        i += 1;
      }
      tokens.push({ type: "ident", value: ident.toLowerCase() });
      continue;
    }

    if ("+-*/^%!,()".includes(ch)) {
      if (ch === "(") tokens.push({ type: "lparen" });
      else if (ch === ")") tokens.push({ type: "rparen" });
      else if (ch === ",") tokens.push({ type: "comma" });
      else tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }

    throw new CalculationError(`Unexpected character: ${ch}`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private mode: AngleMode;

  constructor(tokens: Token[], mode: AngleMode) {
    this.tokens = tokens;
    this.mode = mode;
  }

  parse(): number {
    const value = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new CalculationError("Unexpected extra input");
    }
    return roundResult(value);
  }

  private parseExpression(): number {
    let left = this.parseTerm();
    while (this.matchOp("+", "-")) {
      const op = this.previousOp();
      const right = this.parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  private parseTerm(): number {
    let left = this.parsePower();
    while (this.matchOp("*", "/", "%")) {
      const op = this.previousOp();
      const right = this.parsePower();
      if (op === "*") left *= right;
      else if (op === "/") {
        if (right === 0) throw new CalculationError("Cannot divide by zero");
        left /= right;
      } else {
        if (right === 0) throw new CalculationError("Cannot divide by zero");
        left %= right;
      }
    }
    return left;
  }

  /** Right-associative exponentiation: 2^3^2 = 2^(3^2) = 512 */
  private parsePower(): number {
    let left = this.parseFactorial();
    if (this.matchOp("^")) {
      const right = this.parsePower();
      left = Math.pow(left, right);
    }
    return left;
  }

  private parseFactorial(): number {
    let left = this.parseUnary();
    if (this.matchOp("!")) {
      left = factorial(left);
    }
    return left;
  }

  private parseUnary(): number {
    if (this.matchOp("+", "-")) {
      const op = this.previousOp();
      const value = this.parseUnary();
      return op === "-" ? -value : value;
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.tokens[this.pos];
    if (!token) throw new CalculationError("Incomplete expression");

    if (token.type === "number") {
      this.pos += 1;
      return token.value;
    }

    if (token.type === "ident") {
      const ident = token.value;
      this.pos += 1;

      if (CONSTANTS[ident] !== undefined) {
        return CONSTANTS[ident];
      }

      const fn = FUNCTIONS[ident];
      if (!fn) throw new CalculationError(`Unknown identifier: ${ident}`);

      if (this.tokens[this.pos]?.type !== "lparen") {
        throw new CalculationError(`Expected ( after ${ident}`);
      }
      this.pos += 1;
      const args = this.parseArguments();
      if (this.tokens[this.pos]?.type !== "rparen") {
        throw new CalculationError("Expected )");
      }
      this.pos += 1;
      return fn(args, this.mode);
    }

    if (token.type === "lparen") {
      this.pos += 1;
      const value = this.parseExpression();
      if (this.tokens[this.pos]?.type !== "rparen") {
        throw new CalculationError("Expected )");
      }
      this.pos += 1;
      return value;
    }

    throw new CalculationError("Invalid expression");
  }

  private parseArguments(): number[] {
    if (this.tokens[this.pos]?.type === "rparen") return [];
    const args: number[] = [this.parseExpression()];
    while (this.tokens[this.pos]?.type === "comma") {
      this.pos += 1;
      args.push(this.parseExpression());
    }
    return args;
  }

  private matchOp(...ops: string[]): boolean {
    const token = this.tokens[this.pos];
    if (token?.type === "op" && ops.includes(token.value)) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  private previousOp(): string {
    const token = this.tokens[this.pos - 1];
    return token?.type === "op" ? token.value : "";
  }
}

export function evaluateExpression(
  expression: string,
  mode: AngleMode = "deg",
): number {
  const trimmed = expression.trim();
  if (!trimmed) throw new CalculationError("Enter an expression");

  const normalized = normalizeScientificExpression(trimmed);
  const tokens = tokenize(normalized);
  if (tokens.length === 0) throw new CalculationError("Enter an expression");

  return new Parser(tokens, mode).parse();
}

/**
 * Expand `a+b%` / `a-b%` to percentage-of-a semantics (standard calculator).
 */
function expandBasicPercentages(expression: string): string {
  return expression.replace(
    /(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g,
    (_, left, op, pct) => {
      const base = Number(left);
      const percent = Number(pct);
      const delta = (base * percent) / 100;
      return op === "+" ? `${left}+${delta}` : `${left}-${delta}`;
    },
  );
}

/** Basic calculator: +, -, *, /, sqrt(), unary +/-, percentage-of-base */
export function evaluateBasicExpression(expression: string): number {
  const normalized = expandBasicPercentages(
    expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√\(/g, "sqrt("),
  );

  return evaluateExpression(normalized, "deg");
}

export function formatCalcDisplay(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const rounded = roundResult(value, 12);
  const str = String(rounded);
  if (str.includes("e") || str.includes("E")) {
    return rounded.toPrecision(10);
  }
  if (str.includes(".")) {
    return str.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.$/, "");
  }
  return str;
}
