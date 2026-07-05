/**
 * 2026 ANNUAL tax constants.
 *
 * Primary references (reviewed July 2026):
 * - CRA T4127 122nd ed. (Jan 1, 2026) — annual Option 2 / full-year amounts
 * - CRA T4127 123rd ed. (Jul 1, 2026) — mid-year payroll proration (NOT used here)
 * - CRA T4032 provincial tables
 * - Revenu Québec 2026 income tax rates & QPIP
 *
 * BC note: Annual lowest rate is 5.6% for 2026. The 6.14% rate in T4127-Jul
 * is a payroll catch-up rate for Jul–Dec only and must NOT be used here.
 */

import type { TaxBracket } from "./types";

export const FEDERAL_LOWEST_RATE = 0.14;

/** Federal brackets — CRA 2026 annual (T4127 Table 8.1, Jan edition). */
export const FEDERAL_BRACKETS: TaxBracket[] = [
  { max: 58_523, rate: 0.14 },
  { max: 117_045, rate: 0.205 },
  { max: 181_440, rate: 0.26 },
  { max: 258_482, rate: 0.29 },
  { max: Infinity, rate: 0.33 },
];

export const FEDERAL_BPA_MAX = 16_452;
export const FEDERAL_BPA_MIN = 14_829;
export const FEDERAL_BPA_PHASE_OUT_START = 181_440;
export const FEDERAL_BPA_PHASE_OUT_END = 258_482;
export const FEDERAL_BPA_PHASE_OUT_RANGE = 77_042;
export const FEDERAL_BPA_PHASE_OUT_AMOUNT = 1_623;

/** Canada Employment Amount — non-refundable credit for employees (T4127 Table 8.2). */
export const CANADA_EMPLOYMENT_AMOUNT = 1_501;

/** Capital gains inclusion rate (enacted; 2024–2025 proposed increase was cancelled). */
export const CAPITAL_GAINS_INCLUSION_RATE = 0.5;

export const FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP = 0.38;
export const FEDERAL_ELIGIBLE_DTC_RATE = 0.150198;

/**
 * Provincial DTC on grossed-up eligible dividends (% of grossed-up amount).
 * Stable 2022–2026 per CRA integration; source: CRA/TaxTips provincial tables.
 */
export const PROVINCIAL_ELIGIBLE_DTC_RATES: Record<string, number> = {
  AB: 0.0812,
  BC: 0.12,
  MB: 0.08,
  NB: 0.14,
  NL: 0.063,
  NS: 0.0885,
  NT: 0.115,
  NU: 0.0551,
  ON: 0.1,
  PE: 0.105,
  QC: 0.117,
  SK: 0.11,
  YT: 0.1202,
};

/** Annual provincial brackets — NOT July payroll proration rates. */
export const PROVINCIAL_BRACKETS: Record<string, TaxBracket[]> = {
  AB: [
    { max: 61_200, rate: 0.08 },
    { max: 154_259, rate: 0.1 },
    { max: 185_111, rate: 0.12 },
    { max: 246_813, rate: 0.13 },
    { max: 370_220, rate: 0.14 },
    { max: Infinity, rate: 0.15 },
  ],
  /** Annual 5.6% lowest rate (BC budget Feb 2026); not 6.14% payroll catch-up. */
  BC: [
    { max: 50_363, rate: 0.056 },
    { max: 100_728, rate: 0.077 },
    { max: 115_648, rate: 0.105 },
    { max: 140_430, rate: 0.1229 },
    { max: 190_405, rate: 0.147 },
    { max: 265_545, rate: 0.168 },
    { max: Infinity, rate: 0.205 },
  ],
  MB: [
    { max: 47_000, rate: 0.108 },
    { max: 100_000, rate: 0.1275 },
    { max: Infinity, rate: 0.174 },
  ],
  NB: [
    { max: 52_333, rate: 0.094 },
    { max: 104_666, rate: 0.14 },
    { max: 193_861, rate: 0.16 },
    { max: Infinity, rate: 0.195 },
  ],
  NL: [
    { max: 44_678, rate: 0.087 },
    { max: 89_354, rate: 0.145 },
    { max: 159_528, rate: 0.158 },
    { max: 223_340, rate: 0.178 },
    { max: 285_319, rate: 0.198 },
    { max: 570_638, rate: 0.208 },
    { max: 1_141_275, rate: 0.213 },
    { max: Infinity, rate: 0.218 },
  ],
  NS: [
    { max: 30_995, rate: 0.0879 },
    { max: 61_991, rate: 0.1495 },
    { max: 97_417, rate: 0.1667 },
    { max: 157_124, rate: 0.175 },
    { max: Infinity, rate: 0.21 },
  ],
  NT: [
    { max: 53_003, rate: 0.059 },
    { max: 106_009, rate: 0.086 },
    { max: 172_346, rate: 0.122 },
    { max: Infinity, rate: 0.1405 },
  ],
  NU: [
    { max: 55_801, rate: 0.04 },
    { max: 111_602, rate: 0.07 },
    { max: 181_439, rate: 0.09 },
    { max: Infinity, rate: 0.115 },
  ],
  ON: [
    { max: 53_891, rate: 0.0505 },
    { max: 107_785, rate: 0.0915 },
    { max: 150_000, rate: 0.1116 },
    { max: 220_000, rate: 0.1216 },
    { max: Infinity, rate: 0.1316 },
  ],
  /** PE 2026 annual: new 20% bracket above $200,000 (not 21% Jul payroll catch-up). */
  PE: [
    { max: 33_928, rate: 0.095 },
    { max: 65_820, rate: 0.1347 },
    { max: 106_890, rate: 0.166 },
    { max: 142_520, rate: 0.1762 },
    { max: 200_000, rate: 0.19 },
    { max: Infinity, rate: 0.2 },
  ],
  QC: [
    { max: 54_345, rate: 0.14 },
    { max: 108_680, rate: 0.19 },
    { max: 132_245, rate: 0.24 },
    { max: Infinity, rate: 0.2575 },
  ],
  SK: [
    { max: 54_532, rate: 0.105 },
    { max: 155_805, rate: 0.125 },
    { max: Infinity, rate: 0.145 },
  ],
  YT: [
    { max: 58_523, rate: 0.064 },
    { max: 117_045, rate: 0.09 },
    { max: 181_440, rate: 0.109 },
    { max: 500_000, rate: 0.128 },
    { max: Infinity, rate: 0.15 },
  ],
};

/** Lowest provincial/territorial rate — for non-refundable credit (K1P). */
export const PROVINCIAL_LOWEST_RATES: Record<string, number> = {
  AB: 0.08,
  BC: 0.056,
  MB: 0.108,
  NB: 0.094,
  NL: 0.087,
  NS: 0.0879,
  NT: 0.059,
  NU: 0.04,
  ON: 0.0505,
  PE: 0.095,
  QC: 0.14,
  SK: 0.105,
  YT: 0.064,
};

/**
 * 2026 basic personal / claim amounts for annual estimator (T4127 Table 8.2 Jan).
 * NL: $13,094 annual (not $15,000 Jul payroll proration).
 */
export const PROVINCIAL_BASIC_AMOUNTS: Record<string, number | "formula_mb" | "formula_yt"> = {
  AB: 22_769,
  BC: 13_216,
  MB: "formula_mb",
  NB: 13_664,
  NL: 13_094,
  NS: 11_932,
  NT: 18_198,
  NU: 19_659,
  ON: 12_989,
  PE: 15_000,
  QC: 18_952,
  SK: 20_381,
  YT: "formula_yt",
};

export const MANITOBA_BPA_MAX = 15_780;
export const QUEBEC_FEDERAL_ABATEMENT = 0.165;

/** CPP/QPP 2026 — T4127 Tables 8.3–8.6 (annual totals). */
export const PENSION_BASIC_EXEMPTION = 3_500;
export const PENSION_YMPE = 74_600;
export const PENSION_YAMPE = 85_000;
export const PENSION_YMCE = PENSION_YMPE - PENSION_BASIC_EXEMPTION;
export const PENSION_YAMCE = PENSION_YAMPE - PENSION_YMPE;

export const CPP_BASE_RATE = 0.0495;
export const CPP_FIRST_ADDITIONAL_RATE = 0.01;
export const CPP_SECOND_ADDITIONAL_RATE = 0.04;
export const CPP_TIER1_EMPLOYEE_RATE = CPP_BASE_RATE + CPP_FIRST_ADDITIONAL_RATE;

export const QPP_BASE_RATE = 0.053;
export const QPP_FIRST_ADDITIONAL_RATE = 0.01;
export const QPP_TIER1_EMPLOYEE_RATE = QPP_BASE_RATE + QPP_FIRST_ADDITIONAL_RATE;

export const CPP_MAX_EMPLOYEE_TIER1 = PENSION_YMCE * CPP_TIER1_EMPLOYEE_RATE;
export const CPP_MAX_EMPLOYEE_TIER2 = PENSION_YAMCE * CPP_SECOND_ADDITIONAL_RATE;
export const QPP_MAX_EMPLOYEE_TIER1 = PENSION_YMCE * QPP_TIER1_EMPLOYEE_RATE;

/** EI 2026 — Table 8.7. */
export const EI_MAX_INSURABLE = 68_900;
export const EI_RATE = 0.0163;
export const EI_RATE_QC = 0.013;
export const EI_MAX_PREMIUM = 1_123.07;
export const EI_MAX_PREMIUM_QC = 895.7;

/** QPIP 2026 — Table 8.8. */
export const QPIP_MAX_INSURABLE = 103_000;
export const QPIP_RATE = 0.0043;
export const QPIP_MAX_PREMIUM = 442.9;

/** Ontario surtax thresholds on basic provincial tax T4 (T4127). */
export const ON_SURTAX_THRESHOLD_1 = 5_818;
export const ON_SURTAX_THRESHOLD_2 = 7_446;

/** Ontario tax reduction base (S); Y=0 for default single filer. */
export const ON_TAX_REDUCTION_BASE = 300;

/**
 * Top-up tax credit — maintains 15% on credit bases above first bracket (Bill C-15).
 * Delta vs 14% lowest rate = 1%.
 */
export const TOP_UP_CREDIT_RATE_DELTA = 0.01;

/** BC low-income tax reduction cap — annual $690 (2026 budget; not $805 Jul proration). */
export const BC_TAX_REDUCTION_MAX = 690;
export const BC_TAX_REDUCTION_PHASE_OUT_START = 25_570;
export const BC_TAX_REDUCTION_PHASE_OUT_END = 41_722;
