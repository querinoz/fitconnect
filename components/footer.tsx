import Link from "next/link";
import { Dumbbell, Github, Instagram, Twitter, Youtube } from "lucide-react";

const product = [
  { label: "Find a coach", href: "/discover" },
  { label: "Programs", href: "/programs" },
  { label: "Athlete dashboard", href: "/dashboard" },
  { label: "Community", href: "/community" },
  { label: "Methodology", href: "/methodology" },
  { label: "Pricing", href: "/pricing" }
];

const company = [
  { label: "For coaches", href: "/trainer" },
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
  { label: "Partnerships", href: "#" }
];

const legal = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Trust & Safety", href: "#" },
  { label: "Contact", href: "#" }
];

const social = [
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
  { label: "GitHub", icon: Github, href: "https://github.com/querinoz/fitconnect" }
];

export function Footer() {
  return (
    <footer className="border-t border-ink-800/80 mt-24 bg-ink-950">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950">
              <Dumbbell className="h-5 w-5" />
            </div>
            FitConnect
          </Link>
          <p className="mt-4 text-sm text-ink-400 max-w-xs leading-relaxed">
            The marketplace of verified sport specialists with the science-grade tools usually
            reserved for D1 athletes.
          </p>
          <div className="mt-6 flex gap-2">
            {social.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink-800 text-ink-400 hover:text-ink-100 hover:border-brand-400/40 transition-colors"
              >
                <s.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">Product</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {product.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink-100 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {company.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink-100 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {legal.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink-100 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">Build with us</h4>
          <p className="text-sm text-ink-400 leading-relaxed">
            FitConnect is part of the Querinoz suite. Read our build notes and roadmap on
            GitHub.
          </p>
          <Link
            href="https://github.com/querinoz/fitconnect"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-300 hover:text-brand-200 font-semibold"
          >
            <Github className="h-4 w-4" />
            See the repo
          </Link>
        </div>
      </div>
      <div className="border-t border-ink-800 py-6 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
        <p>
          © {new Date().getFullYear()} FitConnect · Built in Lisbon with discipline, not hype
        </p>
        <p className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
            All systems normal
          </span>
          <span>v2026.5</span>
        </p>
      </div>
    </footer>
  );
}
