import { ProvinceTaxPage } from "@/components/tax/ProvinceTaxPage";
import { createPageMetadata } from "@/lib/metadata";
import { PROVINCE_TAX_PAGES } from "@/lib/tax-province-pages";

const config = PROVINCE_TAX_PAGES.alberta;

export const metadata = createPageMetadata({
  title: config.seoTitle,
  description: config.metaDescription,
  path: `/tax/${config.slug}`,
});

export default function AlbertaTaxPage() {
  return <ProvinceTaxPage config={config} />;
}
