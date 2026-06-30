export type ContributionFrequency =
  | "none"
  | "weekly"
  | "biweekly"
  | "semi-monthly"
  | "monthly"
  | "quarterly"
  | "annually";

/** Periods per year for each contribution frequency */
export const CONTRIBUTION_PERIODS_PER_YEAR: Record<
  ContributionFrequency,
  number
> = {
  none: 0,
  weekly: 52,
  biweekly: 26,
  "semi-monthly": 24,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export const CONTRIBUTION_FREQUENCY_LABELS: Record<
  ContributionFrequency,
  string
> = {
  none: "None",
  weekly: "Weekly",
  biweekly: "Biweekly",
  "semi-monthly": "Semi-monthly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

export function toAnnualContribution(
  amount: number,
  frequency: ContributionFrequency,
): number {
  if (frequency === "none") return 0;
  return amount * CONTRIBUTION_PERIODS_PER_YEAR[frequency];
}

export function formatContributionLabel(
  amount: number,
  frequency: ContributionFrequency,
): string {
  if (frequency === "none") return "No recurring contributions";
  const label = CONTRIBUTION_FREQUENCY_LABELS[frequency].toLowerCase();
  return `$${amount.toLocaleString("en-CA")}/${label}`;
}
