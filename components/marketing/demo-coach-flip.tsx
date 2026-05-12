"use client";

import { Star } from "lucide-react";
import {
  CertificationIcon,
  TargetIcon,
  VideoRoomIcon
} from "@/components/brand/icons";
import { cn } from "@/lib/utils";

/**
 * Coach card flip — a CSS 3D rotation card that loops between the
 * profile face (avatar, name, sport) and the back face (certifications,
 * signature program, sample session).
 *
 * Uses `.fc-flip-scene` + `.fc-flip-card` defined in globals.css.
 * Reduced-motion freezes the card on its front face.
 */
export function DemoCoachFlip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-800 bg-ink-950/70 p-6 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-brand-300 font-bold">
          Coach card
        </p>
        <p className="text-[10px] text-ink-500">Flip every 3.6s</p>
      </div>

      <div className="fc-flip-scene mt-5">
        <div className="fc-flip-card relative h-[280px]">
          {/* Front */}
          <div className="fc-flip-face border border-ink-800 bg-gradient-to-br from-brand-500/10 via-ink-950 to-accent-500/10 p-5">
            <div className="flex items-start gap-3">
              <span className="relative h-14 w-14 rounded-2xl ring-2 ring-brand-400/40 overflow-hidden bg-gradient-to-br from-brand-500/30 to-accent-500/20">
                <Avatar />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-ink-50">
                  Tomás Aguiar
                </p>
                <p className="text-[11px] text-ink-400 truncate">
                  Strength &amp; conditioning · Lisbon
                </p>
                <div className="mt-1 flex items-center gap-1 text-amber-400 text-[11px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                  <span className="ml-1 text-ink-200 font-semibold">4.97</span>
                  <span className="ml-1 text-ink-500">· 184 reviews</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[12px] text-ink-300 leading-relaxed">
              &ldquo;I program around your readiness. If your sleep is
              broken, I&rsquo;ll change the session before 7am.&rdquo;
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Chip label="312 athletes" />
              <Chip label="11 years" />
              <Chip label="€55 / h" highlight />
            </div>
          </div>

          {/* Back */}
          <div className="fc-flip-face fc-flip-back border border-ink-800 bg-gradient-to-br from-plasma-500/10 via-ink-950 to-brand-500/10 p-5">
            <p className="text-[10px] uppercase tracking-widest text-plasma-300 font-bold">
              Certifications &amp; programs
            </p>
            <ul className="mt-3 space-y-2">
              <BackRow
                icon={CertificationIcon}
                title="NSCA · CSCS"
                body="Issued 2017 · validated · in good standing"
              />
              <BackRow
                icon={CertificationIcon}
                title="FMS Level 2"
                body="Movement screen · 2021"
              />
              <BackRow
                icon={TargetIcon}
                title="Signature program"
                body="Strong by Spring · 12 weeks · 614 joined"
              />
              <BackRow
                icon={VideoRoomIcon}
                title="Sample session"
                body="42-min lower body block · screen share + cues"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-lg px-2 py-1.5 text-[10px] font-semibold text-center",
        highlight
          ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30"
          : "bg-ink-900 text-ink-300 ring-1 ring-ink-800"
      )}
    >
      {label}
    </span>
  );
}

function BackRow({
  icon: Icon,
  title,
  body
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-2.5 rounded-lg bg-ink-950/40 ring-1 ring-ink-800 px-3 py-2">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-plasma-500/10 text-plasma-300 shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-ink-100 leading-tight">
          {title}
        </p>
        <p className="text-[10px] text-ink-400 truncate">{body}</p>
      </div>
    </li>
  );
}

/**
 * In-code SVG avatar — abstract athlete bust in brand gradient so we
 * never reach for a stock photo for the homepage demo.
 */
function Avatar() {
  return (
    <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="fcAv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
        <linearGradient id="fcAv2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" stopOpacity="0" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="14" fill="url(#fcAv)" />
      <circle cx="28" cy="22" r="9" fill="#020617" opacity="0.85" />
      <path
        d="M10 56 c4-12 14-18 18-18 s14 6 18 18"
        fill="#020617"
        opacity="0.85"
      />
      <rect width="56" height="56" rx="14" fill="url(#fcAv2)" />
    </svg>
  );
}
