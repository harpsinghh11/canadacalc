import type { MetadataRoute } from "next";
import { SITE_URL, TRUST_PAGES, CURATED_TAX_PAGES } from "@/lib/constants";

const CALCULATOR_PATHS = [
  "/calculator",
  "/scientific-calculator",
  "/tfsa",
  "/fhsa",
  "/compound",
  "/simple-interest",
  "/mortgage",
  "/retirement",
  "/tax",
  "/stocklookback",
  "/find-interest-rate",
  ...CURATED_TAX_PAGES.map((p) => p.href),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...CALCULATOR_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: path === "/tax" ? 0.95 : 0.9,
    })),
    ...TRUST_PAGES.map((page) => ({
      url: `${SITE_URL}${page.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
