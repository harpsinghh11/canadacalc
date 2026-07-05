import { describe, expect, it } from "vitest";
import { calculateBracketTax } from "./brackets";
import {
  buildTaxableIncome,
  calculateEmploymentTaxExample,
  calculateIncomeTaxOnly,
  calculateTax,
} from "./annual-tax";
import {
  calculateFederalNonRefundableCredits,
  federalCanadaEmploymentAmount,
  federalTopUpTaxCredit,
  federalNonRefundableCreditBases,
} from "./contribution-tax";
import {
  calculateEi,
  calculateEmployeePension,
  calculateQpip,
} from "./contributions";
import {
  CANADA_EMPLOYMENT_AMOUNT,
  CAPITAL_GAINS_INCLUSION_RATE,
  CPP_BASE_RATE,
  CPP_FIRST_ADDITIONAL_RATE,
  CPP_MAX_EMPLOYEE_TIER1,
  CPP_MAX_EMPLOYEE_TIER2,
  CPP_SECOND_ADDITIONAL_RATE,
  CPP_TIER1_EMPLOYEE_RATE,
  EI_MAX_PREMIUM,
  EI_MAX_PREMIUM_QC,
  FEDERAL_BPA_MAX,
  FEDERAL_BPA_MIN,
  FEDERAL_BRACKETS,
  FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP,
  FEDERAL_LOWEST_RATE,
  PENSION_YAMCE,
  PENSION_YMPE,
  PROVINCIAL_BASIC_AMOUNTS,
  PROVINCIAL_BRACKETS,
  PROVINCIAL_LOWEST_RATES,
  QPIP_MAX_PREMIUM,
  QPP_MAX_EMPLOYEE_TIER1,
} from "./constants";
import { federalBasicPersonalAmount } from "./federal";
import { grossUpEligibleDividends } from "./dividends";
import { calculateProvincialIncomeTax } from "./provincial";

const employmentOnly = (province: string, employmentIncome: number) =>
  calculateTax({
    province,
    employmentIncome,
    selfEmploymentIncome: 0,
    rentalIncome: 0,
    interestIncome: 0,
    otherIncome: 0,
    otherIncomeLabel: "",
    rrspContribution: 0,
    fhsaContribution: 0,
    capitalGains: 0,
    eligibleDividends: 0,
  });

const zeroPension = {
  base: 0,
  firstAdditional: 0,
  secondAdditional: 0,
  tier1: 0,
  tier2: 0,
  total: 0,
};

describe("federal bracket boundaries", () => {
  it("taxes first bracket at 14% through $58,523", () => {
    expect(calculateBracketTax(58_523, FEDERAL_BRACKETS)).toBeCloseTo(
      58_523 * 0.14,
      2,
    );
    expect(calculateBracketTax(58_524, FEDERAL_BRACKETS)).toBeCloseTo(
      58_523 * 0.14 + 0.205,
      2,
    );
  });

  it("applies BPA phase-out between $181,440 and $258,482", () => {
    expect(federalBasicPersonalAmount(181_440)).toBe(FEDERAL_BPA_MAX);
    expect(federalBasicPersonalAmount(258_482)).toBe(FEDERAL_BPA_MIN);
    expect(federalBasicPersonalAmount(220_000)).toBeCloseTo(15_639.68, 1);
  });

  it("uses 14% federal non-refundable credit rate", () => {
    expect(FEDERAL_LOWEST_RATE).toBe(0.14);
    const credits = calculateFederalNonRefundableCredits({
      basicPersonalAmount: 10_000,
      canadaEmploymentAmount: 0,
      basePensionContribution: 0,
      eiPremium: 0,
      qpipPremium: 0,
    });
    expect(credits.basicPersonal).toBeCloseTo(10_000 * 0.14, 2);
  });
});

describe("CPP/QPP tax treatment", () => {
  const income = 50_000;
  const pensionable = income - 3_500;

  it("splits base CPP for non-refundable credit", () => {
    const pension = calculateEmployeePension(income, false);
    expect(pension.base).toBeCloseTo(pensionable * CPP_BASE_RATE, 2);
    expect(pension.firstAdditional).toBeCloseTo(
      pensionable * CPP_FIRST_ADDITIONAL_RATE,
      2,
    );
    expect(pension.tier1).toBeCloseTo(pension.base + pension.firstAdditional, 2);
  });

  it("deducts first additional CPP from taxable income", () => {
    const pension = calculateEmployeePension(income, false);
    const { taxableIncome, enhancedPensionDeduction } = buildTaxableIncome(
      {
        province: "ON",
        employmentIncome: income,
        selfEmploymentIncome: 0,
        rentalIncome: 0,
        interestIncome: 0,
        otherIncome: 0,
        otherIncomeLabel: "",
        rrspContribution: 0,
        fhsaContribution: 0,
        capitalGains: 0,
        eligibleDividends: 0,
      },
      pension.firstAdditional + pension.secondAdditional,
    );
    expect(enhancedPensionDeduction).toBeCloseTo(pension.firstAdditional, 2);
    expect(taxableIncome).toBe(income - pension.firstAdditional);
  });

  it("credits base CPP at 14% federally", () => {
    const pension = calculateEmployeePension(income, false);
    const credits = calculateFederalNonRefundableCredits({
      basicPersonalAmount: 0,
      canadaEmploymentAmount: 0,
      basePensionContribution: pension.base,
      eiPremium: 0,
      qpipPremium: 0,
    });
    expect(credits.basePension).toBeCloseTo(pension.base * 0.14, 2);
  });

  it("credits base QPP at 14% federally only (not a separate Quebec provincial credit)", () => {
    const pension = calculateEmployeePension(income, true);
    const federalCredits = calculateFederalNonRefundableCredits({
      basicPersonalAmount: 0,
      canadaEmploymentAmount: 0,
      basePensionContribution: pension.base,
      eiPremium: 0,
      qpipPremium: 0,
    });
    expect(federalCredits.basePension).toBeCloseTo(pension.base * 0.14, 2);
    const withQpp = calculateProvincialIncomeTax({
      province: "QC",
      taxableIncome: income,
      netIncome: income,
      grossedUpEligibleDividends: 0,
      pension,
      eiPremium: 0,
      qpipPremium: 0,
    });
    const withoutQpp = calculateProvincialIncomeTax({
      province: "QC",
      taxableIncome: income,
      netIncome: income,
      grossedUpEligibleDividends: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
    });
    expect(withQpp.taxAfterCredits).toBeCloseTo(withoutQpp.taxAfterCredits, 2);
  });

  it("deducts CPP2 from taxable income", () => {
    const pension = calculateEmployeePension(80_000, false);
    expect(pension.secondAdditional).toBeCloseTo(
      (80_000 - PENSION_YMPE) * CPP_SECOND_ADDITIONAL_RATE,
      2,
    );
    const { enhancedPensionDeduction } = buildTaxableIncome(
      {
        province: "ON",
        employmentIncome: 80_000,
        selfEmploymentIncome: 0,
        rentalIncome: 0,
        interestIncome: 0,
        otherIncome: 0,
        otherIncomeLabel: "",
        rrspContribution: 0,
        fhsaContribution: 0,
        capitalGains: 0,
        eligibleDividends: 0,
      },
      pension.firstAdditional + pension.secondAdditional,
    );
    expect(enhancedPensionDeduction).toBeCloseTo(
      pension.firstAdditional + pension.secondAdditional,
      2,
    );
  });
});

describe("EI and QPIP tax credit treatment", () => {
  it("credits EI at 14% federally and provincially", () => {
    const ei = calculateEi(50_000, false);
    expect(ei).toBeCloseTo(50_000 * 0.0163, 2);
    const federalCredits = calculateFederalNonRefundableCredits({
      basicPersonalAmount: 0,
      canadaEmploymentAmount: 0,
      basePensionContribution: 0,
      eiPremium: ei,
      qpipPremium: 0,
    });
    expect(federalCredits.ei).toBeCloseTo(ei * 0.14, 2);

    const pension = calculateEmployeePension(50_000, false);
    const provincial = calculateProvincialIncomeTax({
      province: "ON",
      taxableIncome: 50_000,
      netIncome: 50_000,
      grossedUpEligibleDividends: 0,
      pension,
      eiPremium: ei,
      qpipPremium: 0,
    });
    const gross = calculateBracketTax(50_000, PROVINCIAL_BRACKETS.ON);
    expect(provincial.taxAfterCredits).toBeLessThan(
      gross - ei * PROVINCIAL_LOWEST_RATES.ON,
    );
  });

  it("credits QPIP federally for Quebec employees (K2Q / line 31205)", () => {
    const qpip = calculateQpip(50_000);
    expect(qpip).toBeCloseTo(50_000 * 0.0043, 2);
    const federalCredits = calculateFederalNonRefundableCredits({
      basicPersonalAmount: 0,
      canadaEmploymentAmount: 0,
      basePensionContribution: 0,
      eiPremium: 0,
      qpipPremium: qpip,
    });
    expect(federalCredits.qpip).toBeCloseTo(qpip * FEDERAL_LOWEST_RATE, 2);

    const r = employmentOnly("QC", 50_000);
    expect(r.calculationDetail.qpipPremium).toBeCloseTo(qpip, 2);
    expect(r.calculationDetail.federalNonRefundableCredits).toBeGreaterThan(
      federalBasicPersonalAmount(50_000) * FEDERAL_LOWEST_RATE,
    );
  });

  it("does not grant separate Quebec provincial QPP/EI/QPIP credits", () => {
    const qpip = calculateQpip(50_000);
    const pension = calculateEmployeePension(50_000, true);
    const ei = calculateEi(50_000, true);
    const withPremiums = calculateProvincialIncomeTax({
      province: "QC",
      taxableIncome: 50_000,
      netIncome: 50_000,
      grossedUpEligibleDividends: 0,
      pension,
      eiPremium: ei,
      qpipPremium: qpip,
    });
    const bpaOnly = calculateProvincialIncomeTax({
      province: "QC",
      taxableIncome: 50_000,
      netIncome: 50_000,
      grossedUpEligibleDividends: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
    });
    expect(withPremiums.taxAfterCredits).toBeCloseTo(
      bpaOnly.taxAfterCredits,
      2,
    );
    expect(withPremiums.credits.qpip).toBe(0);
    expect(withPremiums.credits.basePension).toBe(0);
    expect(withPremiums.credits.ei).toBe(0);
  });
});

describe("Canada Employment Amount", () => {
  it("caps at the 2026 maximum", () => {
    expect(federalCanadaEmploymentAmount(100_000)).toBe(
      CANADA_EMPLOYMENT_AMOUNT,
    );
    expect(federalCanadaEmploymentAmount(1_000)).toBe(1_000);
  });

  it("applies CEA only to employment income", () => {
    const pension = calculateEmployeePension(50_000, false);
    const withEmployment = federalNonRefundableCreditBases({
      employmentIncome: 50_000,
      pension,
      eiPremium: calculateEi(50_000, false),
      qpipPremium: 0,
      basicPersonalAmount: federalBasicPersonalAmount(50_000),
      isQuebec: false,
    });
    const withoutEmployment = federalNonRefundableCreditBases({
      employmentIncome: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
      basicPersonalAmount: federalBasicPersonalAmount(50_000),
      isQuebec: false,
    });
    expect(withEmployment.canadaEmploymentAmount).toBe(
      CANADA_EMPLOYMENT_AMOUNT,
    );
    expect(withoutEmployment.canadaEmploymentAmount).toBe(0);
    expect(
      calculateFederalNonRefundableCredits(withEmployment).canadaEmployment,
    ).toBeCloseTo(CANADA_EMPLOYMENT_AMOUNT * FEDERAL_LOWEST_RATE, 2);
  });

  it("does not apply CEA to dividend-only income", () => {
    const dividendsOnly = calculateIncomeTaxOnly({
      province: "ON",
      employmentIncome: 0,
      selfEmploymentIncome: 0,
      rentalIncome: 0,
      interestIncome: 0,
      otherIncome: 0,
      otherIncomeLabel: "",
      rrspContribution: 0,
      fhsaContribution: 0,
      capitalGains: 0,
      eligibleDividends: 50_000,
    });
    const bases = federalNonRefundableCreditBases({
      employmentIncome: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
      basicPersonalAmount: federalBasicPersonalAmount(
        50_000 * (1 + FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP),
      ),
      isQuebec: false,
    });
    expect(bases.canadaEmploymentAmount).toBe(0);
    expect(dividendsOnly.taxableIncome).toBeGreaterThan(50_000);
  });
});

describe("Quebec federal abatement sequencing", () => {
  it("applies 16.5% abatement to basic federal tax after K1, K2Q, and dividend credit", () => {
    const r = employmentOnly("QC", 50_000);
    const detail = r.calculationDetail;
    const expectedBasic =
      detail.federalTaxBeforeCredits -
      detail.federalNonRefundableCredits;
    expect(detail.federalBasicTax).toBeCloseTo(expectedBasic, 2);
    expect(detail.quebecAbatement).toBeCloseTo(
      detail.federalBasicTax * 0.165,
      2,
    );
    expect(r.federalTax).toBeCloseTo(
      detail.federalBasicTax - detail.quebecAbatement,
      2,
    );
  });
});

describe("Top-Up Tax Credit (Bill C-15)", () => {
  it("does not apply when supported credit bases stay below first bracket", () => {
    const pension = calculateEmployeePension(150_000, false);
    const ei = calculateEi(150_000, false);
    const bases = federalNonRefundableCreditBases({
      employmentIncome: 150_000,
      pension,
      eiPremium: ei,
      qpipPremium: 0,
      basicPersonalAmount: federalBasicPersonalAmount(150_000),
      isQuebec: false,
    });
    const totalBases =
      bases.basicPersonalAmount +
      bases.canadaEmploymentAmount +
      bases.basePensionContribution +
      bases.eiPremium +
      bases.qpipPremium;
    expect(totalBases).toBeLessThan(FEDERAL_BRACKETS[0].max);
    expect(federalTopUpTaxCredit(bases)).toBe(0);
  });

  it("would apply 1% on credit bases above the first bracket threshold", () => {
    const bases = {
      basicPersonalAmount: 40_000,
      canadaEmploymentAmount: 1_501,
      basePensionContribution: 10_000,
      eiPremium: 10_000,
      qpipPremium: 0,
    };
    const excess =
      bases.basicPersonalAmount +
      bases.canadaEmploymentAmount +
      bases.basePensionContribution +
      bases.eiPremium +
      bases.qpipPremium -
      FEDERAL_BRACKETS[0].max;
    expect(federalTopUpTaxCredit(bases)).toBeCloseTo(excess * 0.01, 2);
  });
});

describe("provincial brackets and basic credits", () => {
  it("uses BC annual 5.6% lowest bracket — not 6.14% payroll catch-up", () => {
    expect(PROVINCIAL_BRACKETS.BC[0].rate).toBe(0.056);
    const tax50k = calculateBracketTax(50_000, PROVINCIAL_BRACKETS.BC);
    expect(tax50k).toBeCloseTo(50_000 * 0.056, 2);
  });

  it("credits provincial basic personal amount (Alberta)", () => {
    const bpa = PROVINCIAL_BASIC_AMOUNTS.AB as number;
    const gross = calculateBracketTax(50_000, PROVINCIAL_BRACKETS.AB);
    const net = calculateProvincialIncomeTax({
      province: "AB",
      taxableIncome: 50_000,
      netIncome: 50_000,
      grossedUpEligibleDividends: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
    });
    expect(net.taxAfterCredits).toBeCloseTo(
      gross - bpa * PROVINCIAL_LOWEST_RATES.AB,
      2,
    );
  });

  it("credits all 13 jurisdictions with a basic amount entry", () => {
    const codes = Object.keys(PROVINCIAL_BRACKETS);
    expect(codes).toHaveLength(13);
    for (const code of codes) {
      expect(PROVINCIAL_BASIC_AMOUNTS[code]).toBeDefined();
      expect(PROVINCIAL_LOWEST_RATES[code]).toBeGreaterThan(0);
    }
  });
});

describe("Ontario surtax, OHP, and reduction", () => {
  it("includes Ontario Health Premium at $50,000 taxable income", () => {
    const pension = calculateEmployeePension(50_000, false);
    const ei = calculateEi(50_000, false);
    const taxable = 50_000 - pension.firstAdditional;
    const on = calculateProvincialIncomeTax({
      province: "ON",
      taxableIncome: taxable,
      netIncome: 50_000,
      grossedUpEligibleDividends: 0,
      pension,
      eiPremium: ei,
      qpipPremium: 0,
    });
    expect(on.taxAfterCredits).toBeCloseTo(2_288.18, 0);
    expect(on.healthPremium).toBe(600);
  });

  it("applies surtax when basic Ontario tax exceeds $5,818", () => {
    const low = calculateProvincialIncomeTax({
      province: "ON",
      taxableIncome: 40_000,
      netIncome: 40_000,
      grossedUpEligibleDividends: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
    });
    const high = calculateProvincialIncomeTax({
      province: "ON",
      taxableIncome: 120_000,
      netIncome: 120_000,
      grossedUpEligibleDividends: 0,
      pension: zeroPension,
      eiPremium: 0,
      qpipPremium: 0,
    });
    const basicHigh = calculateBracketTax(120_000, PROVINCIAL_BRACKETS.ON);
    expect(high.taxAfterCredits).toBeGreaterThan(basicHigh);
    expect(low.taxAfterCredits).toBeLessThan(high.taxAfterCredits);
  });
});

describe("CPP and CPP2 thresholds", () => {
  const ympeBelow = PENSION_YMPE - 1;
  const ympe = PENSION_YMPE;
  const ympeAbove = PENSION_YMPE + 1;
  const between = 80_000;
  const yampe = 85_000;
  const yampeAbove = 85_001;

  it("caps tier 1 at YMPE", () => {
    expect(calculateEmployeePension(ympeBelow, false).tier1).toBeCloseTo(
      (ympeBelow - 3_500) * CPP_TIER1_EMPLOYEE_RATE,
      2,
    );
    expect(calculateEmployeePension(ympe, false).tier1).toBeCloseTo(
      CPP_MAX_EMPLOYEE_TIER1,
      2,
    );
    expect(calculateEmployeePension(ympe, false).tier2).toBe(0);
  });

  it("starts CPP2 only above YMPE", () => {
    expect(calculateEmployeePension(ympeAbove, false).tier2).toBeCloseTo(0.04, 4);
    expect(calculateEmployeePension(ympeBelow, false).tier2).toBe(0);
  });

  it("applies CPP2 between YMPE and YAMPE", () => {
    expect(calculateEmployeePension(between, false).tier2).toBeCloseTo(
      (between - PENSION_YMPE) * 0.04,
      2,
    );
    expect(calculateEmployeePension(yampe, false).tier2).toBeCloseTo(
      CPP_MAX_EMPLOYEE_TIER2,
      2,
    );
    expect(CPP_MAX_EMPLOYEE_TIER2).toBeCloseTo(PENSION_YAMCE * 0.04, 2);
  });

  it("does not increase CPP2 beyond YAMPE", () => {
    expect(calculateEmployeePension(yampeAbove, false).tier2).toBeCloseTo(
      CPP_MAX_EMPLOYEE_TIER2,
      2,
    );
  });
});

describe("QPP, QPIP, and Quebec EI", () => {
  it("uses higher QPP tier-1 maximum than CPP", () => {
    expect(QPP_MAX_EMPLOYEE_TIER1).toBeGreaterThan(CPP_MAX_EMPLOYEE_TIER1);
    expect(calculateEmployeePension(PENSION_YMPE, true).tier1).toBeCloseTo(
      QPP_MAX_EMPLOYEE_TIER1,
      2,
    );
  });

  it("applies QPP2 on the same YMPE–YAMPE band", () => {
    expect(calculateEmployeePension(80_000, true).tier2).toBeCloseTo(216, 2);
  });

  it("caps QPIP at maximum insurable earnings", () => {
    expect(calculateQpip(50_000)).toBeCloseTo(50_000 * 0.0043, 2);
    expect(calculateQpip(103_000)).toBeCloseTo(QPIP_MAX_PREMIUM, 2);
    expect(calculateQpip(200_000)).toBeCloseTo(QPIP_MAX_PREMIUM, 2);
  });

  it("uses lower Quebec EI maximum premium", () => {
    expect(calculateEi(100_000, true)).toBeCloseTo(EI_MAX_PREMIUM_QC, 2);
    expect(calculateEi(100_000, false)).toBeCloseTo(EI_MAX_PREMIUM, 2);
  });
});

describe("deductions and investment income", () => {
  it("reduces taxable income by RRSP and FHSA", () => {
    const base = buildTaxableIncome({
      province: "ON",
      employmentIncome: 80_000,
      selfEmploymentIncome: 0,
      rentalIncome: 0,
      interestIncome: 0,
      otherIncome: 0,
      otherIncomeLabel: "",
      rrspContribution: 5_000,
      fhsaContribution: 2_000,
      capitalGains: 0,
      eligibleDividends: 0,
    });
    expect(base.taxableIncome).toBe(73_000);
  });

  it("uses 50% capital gains inclusion (2026 enacted rate)", () => {
    expect(CAPITAL_GAINS_INCLUSION_RATE).toBe(0.5);
    const { taxableIncome } = buildTaxableIncome({
      province: "AB",
      employmentIncome: 0,
      selfEmploymentIncome: 0,
      rentalIncome: 0,
      interestIncome: 0,
      otherIncome: 0,
      otherIncomeLabel: "",
      rrspContribution: 0,
      fhsaContribution: 0,
      capitalGains: 20_000,
      eligibleDividends: 0,
    });
    expect(taxableIncome).toBe(10_000);
  });

  it("grosses up eligible dividends by 38%", () => {
    expect(grossUpEligibleDividends(1_000)).toBeCloseTo(1_380, 2);
    const tax = calculateIncomeTaxOnly({
      province: "ON",
      employmentIncome: 0,
      selfEmploymentIncome: 0,
      rentalIncome: 0,
      interestIncome: 0,
      otherIncome: 0,
      otherIncomeLabel: "",
      rrspContribution: 0,
      fhsaContribution: 0,
      capitalGains: 0,
      eligibleDividends: 10_000,
    });
    const noDiv = calculateIncomeTaxOnly({
      province: "ON",
      employmentIncome: 0,
      selfEmploymentIncome: 0,
      rentalIncome: 0,
      interestIncome: 0,
      otherIncome: 0,
      otherIncomeLabel: "",
      rrspContribution: 0,
      fhsaContribution: 0,
      capitalGains: 0,
      eligibleDividends: 0,
    });
    expect(tax.totalIncomeTax).toBeLessThan(
      noDiv.totalIncomeTax + 10_000 * (FEDERAL_LOWEST_RATE + 0.0505),
    );
    expect(tax.taxableIncome).toBeCloseTo(
      10_000 * (1 + FEDERAL_ELIGIBLE_DIVIDEND_GROSS_UP),
      2,
    );
  });
});

describe("regression — Ontario employment income", () => {
  const cases = [
    { income: 50_000, afterTax: 40_144.94, provincial: 2_288.18 },
    { income: 75_000, afterTax: 56_925.83, provincial: 4_446.06 },
    { income: 100_000, afterTax: 74_206.13, provincial: 6_722.75 },
    { income: 150_000, afterTax: 105_100.26, provincial: 13_828.08 },
  ];

  for (const { income, afterTax, provincial } of cases) {
    it(`$${income.toLocaleString()} employment`, () => {
      const r = employmentOnly("ON", income);
      expect(r.afterTaxIncome).toBeCloseTo(afterTax, 0);
      expect(r.provincialTax).toBeCloseTo(provincial, 0);
      if (income >= 75_000) expect(r.cpp2).toBeGreaterThan(0);
    });
  }
});

describe("regression — British Columbia employment income", () => {
  const cases = [
    { income: 50_000, afterTax: 40_573.79, provincial: 1_859.33 },
    { income: 75_000, afterTax: 57_710.56, provincial: 3_661.32 },
    { income: 100_000, afterTax: 75_373.36, provincial: 5_555.52 },
    { income: 150_000, afterTax: 107_376.56, provincial: 11_551.78 },
  ];

  for (const { income, afterTax, provincial } of cases) {
    it(`$${income.toLocaleString()} employment`, () => {
      const r = employmentOnly("BC", income);
      expect(r.afterTaxIncome).toBeCloseTo(afterTax, 0);
      expect(r.provincialTax).toBeCloseTo(provincial, 0);
    });
  }
});

describe("regression — Alberta employment income", () => {
  const cases = [
    { income: 50_000, afterTax: 40_541.18, provincial: 1_891.94 },
    { income: 75_000, afterTax: 57_361.5, provincial: 4_010.38 },
    { income: 100_000, afterTax: 74_458.5, provincial: 6_470.38 },
    { income: 150_000, afterTax: 107_457.96, provincial: 11_470.38 },
  ];

  for (const { income, afterTax, provincial } of cases) {
    it(`$${income.toLocaleString()} employment`, () => {
      const r = employmentOnly("AB", income);
      expect(r.afterTaxIncome).toBeCloseTo(afterTax, 0);
      expect(r.provincialTax).toBeCloseTo(provincial, 0);
    });
  }
});

describe("regression — Quebec employment income", () => {
  const cases = [
    { income: 50_000, afterTax: 38_621.16, qpip: 215, federal: 3_302.72 },
    { income: 75_000, afterTax: 53_689.44, qpip: 322.5, federal: 6_855.72 },
    { income: 100_000, afterTax: 69_309.6, qpip: 430, federal: 11_054.06 },
    { income: 150_000, afterTax: 97_477.12, qpip: 442.9, federal: 21_073 },
  ];

  for (const { income, afterTax, qpip, federal } of cases) {
    it(`$${income.toLocaleString()} employment`, () => {
      const r = employmentOnly("QC", income);
      expect(r.afterTaxIncome).toBeCloseTo(afterTax, 0);
      expect(r.federalTax).toBeCloseTo(federal, 0);
      expect(r.qpip).toBeCloseTo(qpip, 1);
      expect(r.cpp).toBeGreaterThan(r.cpp2);
      expect(r.calculationDetail.quebecAbatement).toBeGreaterThan(0);
    });
  }
});

describe("regression — Northwest Territories employment income", () => {
  it("$75,000 employment", () => {
    const r = calculateEmploymentTaxExample("NT", 75_000);
    expect(r.provincialTax).toBeCloseTo(3_608.81, 0);
    expect(r.afterTaxIncome).toBeCloseTo(57_763.08, 0);
  });
});
