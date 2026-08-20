import { LabelCaps } from "@/components/elite-os/typography";
import { BentoCard } from "@/components/elite-os/bento-card";

export const metadata = {
  title: "Terms · FitConnect",
  description: "Technical terms placeholder. Legal review is PENDING_HUMAN."
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-ink-100">
      <LabelCaps className="text-eos-voltline">Legal · PENDING_HUMAN</LabelCaps>
      <h1 className="mt-3 font-display text-4xl text-ink-50">Terms of use (technical)</h1>
      <p className="mt-4 text-sm text-ink-300">
        FitConnect is not production-ready. Hosted previews are not a certified SaaS launch.
        Counsel must draft enforceable Terms before real users.
      </p>
      <BentoCard elevation="1" className="mt-8">
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink-300">
          <li>Do not upload data you are not allowed to process.</li>
          <li>Strava content stays with the connected athlete and is never a social graph.</li>
          <li>LOCAL_DEMO accounts are not production identities.</li>
          <li>Rate limits and fail-closed webhooks may reject traffic without secrets configured.</li>
        </ul>
      </BentoCard>
    </main>
  );
}
