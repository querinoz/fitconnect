"use client";

import { Testimonials } from "@/components/testimonials";
import { ActivityFeedLive } from "@/components/dashboard/os/activity-feed-live";
import { SectionHeader } from "@/components/ui-glass/premium-system";
import { useLocale } from "@/lib/i18n-provider";

/** Section 10 — testimonials + live activity feed widget. */
export function SocialProofSection() {
  const locale = useLocale();
  const feed = locale.dashboard.activity_feed;

  return (
    <div className="landing-v2-social">
      <Testimonials />
      <section className="mx-auto max-w-7xl fc-section-x px-4 pb-20 sm:px-6">
        <SectionHeader
          eyebrow={feed.live}
          title={feed.title}
          body={feed.empty}
          className="max-w-xl"
        />
        <div className="mt-8">
          <ActivityFeedLive />
        </div>
      </section>
    </div>
  );
}
