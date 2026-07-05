import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout } from "@/components/TrustPageLayout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "About CanadaCalc",
  description:
    "CanadaCalc is an independent Canadian calculator site that explains what your financial numbers mean.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <TrustPageLayout
      title="About CanadaCalc"
      description="Independent tools built to make Canadian personal finance easier to understand."
    >
      <p>
        {`CanadaCalc is an independent Canadian website — not affiliated with the
        Government of Canada, CRA, or any bank. We build free calculators that
        help you estimate tax, mortgage payments, savings growth, retirement
        projections, and more.`}
      </p>
      <p>
        Our focus is clarity: every tool is designed to show{" "}
        <strong>what the number means</strong>, not just the number itself. We
        explain assumptions, link to official sources where it helps, and call
        out limitations so you can decide when to talk to a professional.
      </p>
      <p>
        Your inputs stay in your browser. We do not require signup, and we do
        not store your personal financial details on our servers.
      </p>
      <p>
        Questions or feedback? Visit our{" "}
        <Link href="/contact" className="text-[var(--brand)] underline">
          contact page
        </Link>
        . For how we build and update calculators, see{" "}
        <Link href="/methodology" className="text-[var(--brand)] underline">
          methodology
        </Link>
        .
      </p>
    </TrustPageLayout>
  );
}
