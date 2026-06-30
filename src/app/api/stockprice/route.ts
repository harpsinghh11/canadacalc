import { NextRequest, NextResponse } from "next/server";

const YAHOO_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com",
  Origin: "https://finance.yahoo.com",
};

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: (number | null)[];
        }>;
      };
    }>;
    error?: { code?: string; description?: string };
  };
}

type ErrorCode =
  | "INVALID_TICKER"
  | "DATE_TOO_OLD"
  | "MARKET_CLOSED"
  | "NETWORK"
  | "RATE_LIMIT"
  | "MISSING_PARAMS";

function errorResponse(
  message: string,
  code: ErrorCode,
  status: number,
) {
  return NextResponse.json({ error: message, code }, { status });
}

function buildChartUrl(
  host: "query1" | "query2",
  ticker: string,
  query: string,
): string {
  return `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?${query}`;
}

async function fetchYahoo(
  url: string,
): Promise<{ ok: true; data: YahooChartResponse } | { ok: false; status: number; body: string }> {
  try {
    const response = await fetch(url, {
      headers: YAHOO_HEADERS,
      cache: "no-store",
    });
    const body = await response.text();
    if (!response.ok) {
      return { ok: false, status: response.status, body };
    }
    const data = JSON.parse(body) as YahooChartResponse;
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, body: message };
  }
}

async function fetchWithRetry(
  buildQuery: string,
  ticker: string,
): Promise<
  | { ok: true; data: YahooChartResponse }
  | { ok: false; kind: "INVALID_TICKER" | "NETWORK" | "RATE_LIMIT"; lastError: string }
> {
  let sawNotFound = false;
  let sawRateLimit = false;

  for (const host of ["query1", "query2"] as const) {
    const url = buildChartUrl(host, ticker, buildQuery);
    const result = await fetchYahoo(url);
    if (result.ok) {
      if (result.data.chart?.error) {
        const desc = result.data.chart.error.description ?? "";
        console.error(
          `[stockprice] Yahoo chart error (${host}):`,
          JSON.stringify(result.data.chart.error),
        );
        if (/not found|invalid|delisted|no data/i.test(desc)) {
          sawNotFound = true;
        }
        continue;
      }
      if (result.data.chart?.result?.[0]) {
        return result;
      }
      console.error(
        `[stockprice] Empty result (${host}):`,
        JSON.stringify(result.data),
      );
    } else {
      console.error(
        `[stockprice] Fetch failed (${host}) status=${result.status}:`,
        result.body,
      );
      if (result.status === 404) sawNotFound = true;
      if (result.status === 429) sawRateLimit = true;
    }
  }

  if (sawRateLimit) {
    return {
      ok: false,
      kind: "RATE_LIMIT",
      lastError: "Yahoo Finance rate limit reached",
    };
  }
  if (sawNotFound) {
    return { ok: false, kind: "INVALID_TICKER", lastError: "Ticker not found" };
  }
  return {
    ok: false,
    kind: "NETWORK",
    lastError: "All Yahoo Finance endpoints failed",
  };
}

function extractClosePrice(data: YahooChartResponse): {
  price: number | null;
  priceDate: string | null;
} {
  const result = data.chart?.result?.[0];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result?.timestamp ?? [];

  for (let i = closes.length - 1; i >= 0; i--) {
    const close = closes[i];
    if (close !== null && close !== undefined && !Number.isNaN(close)) {
      const priceDate = timestamps[i]
        ? new Date(timestamps[i] * 1000).toISOString().split("T")[0]
        : null;
      return { price: close, priceDate };
    }
  }

  return { price: null, priceDate: null };
}

function extractPriceSeries(data: YahooChartResponse): {
  date: string;
  price: number;
}[] {
  const result = data.chart?.result?.[0];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result?.timestamp ?? [];
  const series: { date: string; price: number }[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close !== null && close !== undefined && !Number.isNaN(close)) {
      series.push({
        date: new Date(timestamps[i]! * 1000).toISOString().split("T")[0]!,
        price: close,
      });
    }
  }

  return series;
}

function getIntervalForRange(
  startDate: string,
  endDate: string,
): "1d" | "1wk" | "1mo" {
  const start = new Date(startDate + "T12:00:00Z");
  const end = new Date(endDate + "T12:00:00Z");
  const days = Math.max(0, (end.getTime() - start.getTime()) / 86_400_000);

  if (days <= 92) return "1d";
  if (days <= 365 * 3) return "1wk";
  return "1mo";
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function fetchHistoricalPrice(
  ticker: string,
  dateStr: string,
): Promise<NextResponse> {
  const date = new Date(dateStr + "T12:00:00Z");
  if (isNaN(date.getTime())) {
    return errorResponse("Invalid date", "MISSING_PARAMS", 400);
  }

  if (date < new Date("2000-01-01T00:00:00Z")) {
    return errorResponse(
      "Please select a date after January 1, 2000",
      "DATE_TOO_OLD",
      400,
    );
  }

  const period1 = Math.floor(date.getTime() / 1000);
  const period2 = period1 + 86400;
  const query = `interval=1d&period1=${period1}&period2=${period2}`;

  const result = await fetchWithRetry(query, ticker);

  if (!result.ok) {
    if (result.kind === "INVALID_TICKER") {
      return errorResponse(
        `Ticker '${ticker}' not found. Try a valid symbol like AAPL, NVDA, or CNR.TO`,
        "INVALID_TICKER",
        404,
      );
    }
    return errorResponse(
      "Unable to fetch data right now. Please try again in a moment",
      "NETWORK",
      502,
    );
  }

  let { price, priceDate } = extractClosePrice(result.data);

  if (price === null && !isWeekend(date)) {
    const weekPeriod1 = period1 - 7 * 86400;
    const weekQuery = `interval=1d&period1=${weekPeriod1}&period2=${period2}`;
    const weekResult = await fetchWithRetry(weekQuery, ticker);

    if (weekResult.ok) {
      const extracted = extractClosePrice(weekResult.data);
      price = extracted.price;
      priceDate = extracted.priceDate;
    }
  }

  if (price === null) {
    return errorResponse(
      "No trading data for that date — markets were closed. Try the nearest weekday instead",
      "MARKET_CLOSED",
      404,
    );
  }

  return NextResponse.json({
    price,
    date: priceDate ?? dateStr,
  });
}

async function fetchCurrentPrice(ticker: string): Promise<NextResponse> {
  const query = "range=1d&interval=1m";
  const result = await fetchWithRetry(query, ticker);

  if (!result.ok) {
    if (result.kind === "INVALID_TICKER") {
      return errorResponse(
        `Ticker '${ticker}' not found. Try a valid symbol like AAPL, NVDA, or CNR.TO`,
        "INVALID_TICKER",
        404,
      );
    }
    return errorResponse(
      "Unable to fetch data right now. Please try again in a moment",
      "NETWORK",
      502,
    );
  }

  const { price, priceDate } = extractClosePrice(result.data);

  if (price === null) {
    return errorResponse(
      `Ticker '${ticker}' not found. Try a valid symbol like AAPL, NVDA, or CNR.TO`,
      "INVALID_TICKER",
      404,
    );
  }

  return NextResponse.json({
    price,
    date: priceDate ?? new Date().toISOString().split("T")[0],
  });
}

async function fetchPriceSeries(
  ticker: string,
  startDateStr: string,
  endDateStr: string,
): Promise<NextResponse> {
  const startDate = new Date(startDateStr + "T12:00:00Z");
  const endDate = new Date(endDateStr + "T12:00:00Z");

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return errorResponse("Invalid date range", "MISSING_PARAMS", 400);
  }

  if (startDate < new Date("2000-01-01T00:00:00Z")) {
    return errorResponse(
      "Please select a date after January 1, 2000",
      "DATE_TOO_OLD",
      400,
    );
  }

  if (startDate > endDate) {
    return errorResponse("Start date must be before end date", "MISSING_PARAMS", 400);
  }

  const interval = getIntervalForRange(startDateStr, endDateStr);
  const period1 = Math.floor(startDate.getTime() / 1000);
  const period2 = Math.floor(endDate.getTime() / 1000) + 86_400;
  const query = `interval=${interval}&period1=${period1}&period2=${period2}`;

  const result = await fetchWithRetry(query, ticker);

  if (!result.ok) {
    if (result.kind === "INVALID_TICKER") {
      return errorResponse(
        `Ticker '${ticker}' not found. Try a valid symbol like AAPL, NVDA, or CNR.TO`,
        "INVALID_TICKER",
        404,
      );
    }
    if (result.kind === "RATE_LIMIT") {
      return errorResponse(
        "Unable to load price history right now. Please try again in a moment",
        "RATE_LIMIT",
        429,
      );
    }
    return errorResponse(
      "Unable to load price history right now. Please try again in a moment",
      "NETWORK",
      502,
    );
  }

  const series = extractPriceSeries(result.data);

  if (series.length === 0) {
    return errorResponse(
      "No price history available for that date range",
      "MARKET_CLOSED",
      404,
    );
  }

  return NextResponse.json({
    series,
    interval,
    startDate: startDateStr,
    endDate: endDateStr,
  });
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker")?.trim();
  const dateStr = request.nextUrl.searchParams.get("date");
  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");
  const isCurrent = request.nextUrl.searchParams.get("current") === "true";

  if (!ticker) {
    return errorResponse(
      "Missing ticker parameter",
      "MISSING_PARAMS",
      400,
    );
  }

  try {
    if (startDate && endDate) {
      return await fetchPriceSeries(ticker, startDate, endDate);
    }
    if (isCurrent || !dateStr) {
      return await fetchCurrentPrice(ticker);
    }
    return await fetchHistoricalPrice(ticker, dateStr);
  } catch (err) {
    console.error("[stockprice] Unexpected error:", err);
    return errorResponse(
      "Unable to fetch data right now. Please try again in a moment",
      "NETWORK",
      500,
    );
  }
}
