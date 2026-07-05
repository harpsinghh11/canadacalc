import type { Metadata } from "next";
import { TrustPageLayout } from "@/components/TrustPageLayout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch with the CanadaCalc team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <TrustPageLayout
      title="Contact"
      description="Questions, corrections, or feedback about our calculators."
    >
      <p>
        We read every message. If you spot an error in a formula, outdated limit,
        or confusing explanation, let us know — accuracy and clarity matter to
        us.
      </p>
      <p>
        Email:{" "}
        <a
          href="mailto:hello@canadacalc.net"
          className="font-medium text-[var(--brand)] underline hover:text-[var(--brand-hover)]"
        >
          hello@canadacalc.net
        </a>
      </p>
      <p className="text-slate-600">
        We typically respond within a few business days. We cannot provide
        personal tax, legal, or investment advice.
      </p>
    </TrustPageLayout>
  );
}
