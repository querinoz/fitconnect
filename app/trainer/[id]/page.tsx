import { notFound } from "next/navigation";
import { TRAINERS, REVIEWS } from "@/lib/data";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ShieldCheck, MessageSquare, Video, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function TrainerPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = TRAINERS.find((x) => x.id === id);
  if (!t) return notFound();
  const reviews = REVIEWS.filter((r) => r.trainerId === t.id);

  return (
    <>
      <Nav />
      <main>
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src={t.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl px-6 -mt-24 relative grid lg:grid-cols-[1fr_360px] gap-10">
          <section>
            <div className="flex items-center gap-5">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-28 w-28 rounded-3xl ring-4 ring-ink-950 object-cover"
              />
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold">{t.name}</h1>
                <p className="mt-1 text-ink-300">{t.headline}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {t.city}, {t.country}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" /> {t.rating} ({t.reviews})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {t.responseTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {t.sports.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              {t.highlights.map((h) => (
                <Badge key={h} className="bg-accent-500/10 text-accent-500 ring-accent-500/30">
                  {h}
                </Badge>
              ))}
            </div>

            <section className="mt-10 rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
              <h2 className="font-display text-2xl font-semibold">About me</h2>
              <p className="mt-3 text-ink-300 leading-relaxed">{t.bio}</p>
              <p className="mt-4 text-ink-300 italic">&ldquo;{t.intro}&rdquo;</p>
            </section>

            <section className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-500" /> Verified credentials
              </h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {t.certifications.map((c) => (
                  <li
                    key={c}
                    className="rounded-xl border border-ink-800 bg-ink-950/60 px-4 py-3 text-sm flex items-center justify-between"
                  >
                    <span>{c}</span>
                    <Badge className="bg-accent-500/10 text-accent-500 ring-accent-500/30">
                      Verified
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
              <h2 className="font-display text-2xl font-semibold">Athlete reviews</h2>
              <div className="mt-4 space-y-4">
                {reviews.length === 0 && (
                  <p className="text-ink-400">No reviews yet for this profile.</p>
                )}
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-ink-800 bg-ink-950/40 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{r.author}</p>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-ink-300 text-sm">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-2xl border border-ink-800 bg-ink-900/60 p-6">
              <p className="text-sm text-ink-400">Starting from</p>
              <p className="text-4xl font-bold font-display">{formatPrice(t.hourlyRate)}</p>
              <p className="text-xs text-ink-400">per 60-min session</p>

              <div className="mt-6 space-y-2">
                <Button className="w-full" size="lg">
                  <Calendar className="h-4 w-4" /> Book a session
                </Button>
                <Button className="w-full" size="lg" variant="outline">
                  <Video className="h-4 w-4" /> Free 15-min intro call
                </Button>
                <Button className="w-full" size="lg" variant="ghost">
                  <MessageSquare className="h-4 w-4" /> Message {t.name.split(" ")[0]}
                </Button>
              </div>
              <p className="mt-6 text-xs text-ink-500 text-center">
                Free cancellation up to 24h before · Verified specialist · Secure Stripe payments
              </p>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 text-sm">
              <p className="font-semibold mb-3">This coach is great if you...</p>
              <ul className="space-y-2 text-ink-300">
                <li>· Want measurable, structured progress</li>
                <li>· Prefer video-based form review</li>
                <li>· Train 2–5x per week</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  return TRAINERS.map((t) => ({ id: t.id }));
}
