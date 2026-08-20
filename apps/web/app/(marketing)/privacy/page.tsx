import { LabelCaps } from "@/components/elite-os/typography";
import { BentoCard } from "@/components/elite-os/bento-card";

export const metadata = {
  title: "Privacy · FitConnect",
  description: "Technical description of how FitConnect handles data. Legal review is PENDING_HUMAN."
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-ink-100">
      <LabelCaps className="text-eos-voltline">Legal · PENDING_HUMAN</LabelCaps>
      <h1 className="mt-3 font-display text-4xl text-ink-50">Privacy (technical)</h1>
      <p className="mt-4 text-sm text-ink-300">
        This page describes current software behavior. It is not legal advice. Counsel must
        review copy before production launch.
      </p>
      <div className="mt-8 grid gap-4">
        <BentoCard elevation="1">
          <h2 className="text-lg font-semibold">Identity</h2>
          <p className="mt-2 text-sm text-ink-300">
            Firebase Authentication issues the user id (UID). Product rows that use that UID are
            authorized in Supabase Postgres with row-level security. Service-role keys are not
            shipped to browsers or the Android APK.
          </p>
        </BentoCard>
        <BentoCard elevation="1">
          <h2 className="text-lg font-semibold">Health and location</h2>
          <p className="mt-2 text-sm text-ink-300">
            Health Connect is the intended fitness-data core. Live GPS capture is not production
            certified. Location and health streams must not be treated as medical devices.
          </p>
        </BentoCard>
        <BentoCard elevation="1">
          <h2 className="text-lg font-semibold">Strava</h2>
          <p className="mt-2 text-sm text-ink-300">
            Strava data is own-athlete only. Sessions with provider STRAVA are not shareable in
            feeds, rankings, badges, maps, or other-user profiles. Coaches do not receive an
            athlete&apos;s Strava activities by roster association.
          </p>
        </BentoCard>
        <BentoCard elevation="1" id="trust">
          <h2 className="text-lg font-semibold">Social, squad, coaching</h2>
          <p className="mt-2 text-sm text-ink-300">
            Social v1 and Squad persistence are not a production GO. Coaching calendar sessions are
            separate from Strava imports. Analytics (PostHog), FCM, and Crashlytics are
            PENDING_HUMAN in production.
          </p>
        </BentoCard>
        <BentoCard elevation="1">
          <h2 className="text-lg font-semibold">Deletion</h2>
          <p className="mt-2 text-sm text-ink-300">
            Authenticated users can request deletion at{" "}
            <a className="text-eos-voltline underline" href="/settings/privacy">
              Settings · Privacy
            </a>
            . App identity and Strava tokens are purged when the API succeeds. Firebase Auth user
            deletion remains PENDING_HUMAN (Admin SDK / console).
          </p>
        </BentoCard>
      </div>
    </main>
  );
}
