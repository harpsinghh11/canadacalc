import {
  CALCULATORS,
  CURATED_TAX_PAGES,
  type CalculatorCategoryId,
} from "@/lib/constants";

export interface SearchableTool {
  href: string;
  title: string;
  description: string;
  category?: CalculatorCategoryId | "province";
  keywords: string[];
}

function buildSearchIndex(): SearchableTool[] {
  const calculators: SearchableTool[] = CALCULATORS.map((c) => ({
    href: c.href,
    title: c.title,
    description: c.description,
    category: c.category,
    keywords: [
      c.title.toLowerCase(),
      c.navLabel.toLowerCase(),
      c.category,
      c.href.replace("/", ""),
    ],
  }));

  const provinces: SearchableTool[] = CURATED_TAX_PAGES.map((p) => {
    const slug = p.href.split("/").pop() ?? "";
    const provinceName =
      p.href === "/tax/british-columbia"
        ? "british columbia"
        : p.href === "/tax/ontario"
          ? "ontario"
          : p.href === "/tax/alberta"
            ? "alberta"
            : "quebec";
    const extraKeywords =
      p.href === "/tax/british-columbia"
        ? ["bc", "british columbia", "british columbia tax"]
        : p.href === "/tax/ontario"
          ? ["ontario", "on", "ontario income tax"]
          : p.href === "/tax/alberta"
            ? ["alberta", "ab", "alberta tax"]
            : ["quebec", "qc", "quebec tax"];

    return {
      href: p.href,
      title: p.label,
      description: `Provincial income tax estimate for ${p.label.replace(" Tax Calculator", "")}.`,
      category: "province" as const,
      keywords: [
        p.label.toLowerCase(),
        "tax",
        "income tax",
        `${provinceName} tax`,
        `${provinceName} income tax`,
        "province",
        slug,
        ...extraKeywords,
      ],
    };
  });

  return [...calculators, ...provinces];
}

const SEARCH_INDEX = buildSearchIndex();

export function searchCalculators(query: string, limit = 8): SearchableTool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = SEARCH_INDEX.map((item) => {
    let score = 0;
    if (item.title.toLowerCase().includes(q)) score += 10;
    if (item.href.toLowerCase().includes(q)) score += 8;
    for (const kw of item.keywords) {
      if (kw.includes(q)) score += 5;
      if (kw.startsWith(q)) score += 3;
    }
    if (item.description.toLowerCase().includes(q)) score += 2;
    return { item, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.item);
}

export { SEARCH_INDEX };
