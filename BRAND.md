# FitConnect — Brand book

> Living document. Last edited Q2 2026. If something here disagrees with what&rsquo;s shipped in `tailwind.config.ts` or `app/globals.css`, the code wins and this file is wrong — open a PR.

---

## 1. Mission, promise, vibe

### Mission
**Make a world-class specialist coach as accessible as a yoga app.**

### Brand promise (the one we keep)
> A real human who lives your sport, verified to the issuing body, met before you pay a cent.

If we ever break that promise, the brand is dead. Everything else flows from it.

### Vibe in three words
**Specialist. Honest. Calm.**

- **Specialist** — we sound like someone who knows the difference between a Vinyasa flow and a Bikram class.
- **Honest** — we publish what works, what doesn&rsquo;t, what we charge and where we lose to competitors.
- **Calm** — we don&rsquo;t shout. The work is the noise.

### What we are not
We are not a hype brand. We are not a wellness brand. We are not a SaaS brand. We are the &ldquo;made-in-Italy&rdquo; of training: precise, opinionated, and recognisable from across the room.

---

## 2. The mark

The FitConnect mark is the **Lucide Dumbbell icon** sitting in a **rounded square gradient pill** (cyan 400 → lime 500, 135°), 9×9 at the standard, with **2xl rounded corners**.

```tsx
<div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950">
  <Dumbbell className="h-5 w-5" />
</div>
```

### Wordmark
- Full lockup: **`Fit` (white) + `Connect` (cyan 400)**, set in Space Grotesk Bold, with normal letter-spacing, no italics.
- Standalone wordmark variant: all white on dark, cyan-400 on light.

```tsx
<span className="font-display font-bold">
  Fit<span className="text-brand-400">Connect</span>
</span>
```

### Clearspace
Minimum clearspace around the mark = the height of the Dumbbell glyph (= half the pill height). Do not crowd it with copy or other icons.

### Do
- Use the gradient pill against any dark surface (`ink-950`, `ink-900`).
- Use the wordmark on its own when the mark would compete (e.g. headers).
- Pair with a glow halo when the surface is particularly busy.

### Don&rsquo;t
- Don&rsquo;t apply the gradient to the glyph itself — the glyph stays solid `ink-950`.
- Don&rsquo;t use the wordmark in a colour other than white / cyan-400 / `ink-950`.
- Don&rsquo;t rotate the mark.
- Don&rsquo;t outline it.

### Variants
| Use | Construction |
| --- | --- |
| Default (dark UI) | Gradient pill + white wordmark with cyan-400 second-half |
| Light surface | Gradient pill (unchanged) + `ink-950` wordmark + `brand-600` second-half |
| Monochrome | Solid `ink-50` pill, `ink-950` glyph, `ink-50` wordmark |
| Favicon (16/32) | Pill only, no wordmark |
| Print / B&amp;W | `ink-950` pill, white glyph, `ink-950` wordmark |

---

## 3. Colour palette

### Primary

| Token | Hex | Use |
| --- | --- | --- |
| `brand-400` | `#22d3ee` | Primary accent — links, highlights, the second half of the wordmark |
| `brand-500` | `#06b6d4` | Buttons gradient start, hover states |
| `accent-500` | `#84cc16` | Secondary accent — success, gradient end, &ldquo;train hard&rdquo; |
| `accent-400` | `#a3e635` | Success badges, accent-on-dark |
| `signal-500` | `#f43f5e` | HRV, warmth highlights, the &ldquo;heart&rdquo; channel |
| `plasma-500` | `#a855f7` | AI, suggestion, intelligent automation cues |

### Neutrals (ink)

| Token | Hex | Use |
| --- | --- | --- |
| `ink-50` | `#f8fafc` | Headlines on dark, max contrast |
| `ink-100` | `#f1f5f9` | Body on dark, primary text |
| `ink-200` | `#e2e8f0` | Soft body, secondary headings |
| `ink-300` | `#cbd5e1` | Lead paragraphs, blockquotes |
| `ink-400` | `#94a3b8` | Body on dark, captions |
| `ink-500` | `#64748b` | Muted text, metadata, eyebrows |
| `ink-700` | `#334155` | Outlines, dividers |
| `ink-800` | `#1e293b` | Cards, surfaces (default `bg-ink-900/40`) |
| `ink-900` | `#0f172a` | Page background mid-tone |
| `ink-950` | `#020617` | Page background floor; logo glyph fill |

### Gradients (the brand colour story)

```css
/* Default — cyan → lime. Optimistic, athletic. */
background: linear-gradient(90deg, #22d3ee, #84cc16);

/* Warm — rose → plasma. Used for testimonials &amp; emotional sections. */
background: linear-gradient(90deg, #f43f5e, #a855f7);

/* Ambient — radial cyan / lime / plasma blobs behind heroes. */
background:
  radial-gradient(ellipse at top left, rgba(34,211,238,.22), transparent 50%),
  radial-gradient(ellipse at bottom right, rgba(132,204,22,.18), transparent 50%),
  radial-gradient(ellipse at 70% 20%, rgba(168,85,247,.1), transparent 55%);
```

### Usage rules

- **Dark by default.** Light-mode variables exist in `globals.css` but every shipped page renders dark.
- **One gradient per surface.** Never stack the cool and warm gradients in the same card.
- **Plasma is for AI.** When the user sees plasma, it&rsquo;s because the system is making a suggestion, not the brand.
- **Signal is for the heart.** Use it exclusively in HRV, recovery, and athlete-emotion contexts.
- **Accent (lime) is for &ldquo;yes&rdquo;.** Verified badges, success confirms, &ldquo;train hard&rdquo; readiness, growth deltas.

### Accessibility

| Foreground | Background | Contrast | Verdict |
| --- | --- | --- | --- |
| `ink-50` | `ink-950` | 16.7:1 | AAA |
| `ink-200` | `ink-950` | 13.4:1 | AAA |
| `ink-400` | `ink-950` | 7.1:1 | AAA |
| `ink-500` | `ink-950` | 5.0:1 | AA |
| `brand-400` | `ink-950` | 11.8:1 | AAA |
| `accent-500` | `ink-950` | 9.4:1 | AAA |
| `ink-950` on `brand-400→accent-500` button | — | 14.0:1 (avg) | AAA |

Body text never drops below `ink-300` on `ink-950`. Captions / metadata never drop below `ink-500`.

---

## 4. Type system

### Faces

| Role | Family | Why |
| --- | --- | --- |
| Display / headlines | **Space Grotesk** (400 / 500 / 700 / 800) | A modern grotesk with athletic posture. Reads sharp at 64px, has personality. |
| Body / UI | **Inter** (400 / 500 / 600 / 700) | The most readable open neutral sans. Pairs cleanly with Space Grotesk. |
| Numerals (KPIs) | Inter + Space Grotesk with `tabular-nums` | Numbers align in dashboards. Use `font-feature-settings: ss01, cv01` for cleaner digits. |

Loaded via `next/font` with `display: swap`, no Cumulative Layout Shift.

### Scale

| Token | Class | Use |
| --- | --- | --- |
| Display XL | `text-7xl md:text-8xl` | Single-line headlines (methodology pillars) |
| Display L | `text-5xl md:text-6xl` | Page heroes |
| Display M | `text-4xl md:text-5xl` | Section headings |
| Display S | `text-3xl md:text-4xl` | Subsection headings |
| Heading | `text-2xl` | Card titles, sidebar headers |
| Body L | `text-lg` | Hero subtitles, lead paragraphs |
| Body | `text-base` | Body copy |
| Body S | `text-sm` | Card body |
| Caption | `text-xs` | Metadata, captions, footers |
| Eyebrow | `text-xs uppercase tracking-[0.18em]` font-semibold cyan-400 | Section labels |

### Hierarchy rules

- **One H1 per page.** Always wrap in a `<section>` with the eyebrow above it.
- **Use the gradient sparingly.** Most headlines should be `ink-50`; only one phrase per page (the &ldquo;hero&rdquo; phrase) gets the gradient.
- **Balance, don&rsquo;t centre.** Display copy uses `text-balance`. Long paragraphs use `text-pretty`.
- **Numbers earn their weight.** KPIs go in `font-display font-bold tabular-nums gradient-text`.
- **Lowercase soft-shouts.** Headlines stay sentence-case. We don&rsquo;t shout in caps.

---

## 5. Motion principles

We move things when motion clarifies something. We don&rsquo;t move things to entertain.

### Five principles

1. **Out-expo easing on entrance.** The default ease is `cubic-bezier(0.16, 1, 0.3, 1)` — fast in, soft landing. Available as `ease-out-expo`.
2. **Spring on interaction.** Buttons, cards and toggles snap with `cubic-bezier(0.25, 1.5, 0.5, 1)`. Available as `ease-spring`.
3. **Reveal once.** `whileInView` always uses `viewport={{ once: true }}`. Repeated reveals are noise.
4. **Cascade in 60–90 ms steps.** When a grid of cards reveals, the delay between siblings is `i * 0.06`s — perceptibly sequential without feeling slow.
5. **Reduce motion = reduce motion.** When `prefers-reduced-motion` is set, we cut all `whileInView` animations and disable parallax. The product still works; it just doesn&rsquo;t dance.

### Reusable animations

| Token | Duration | Use |
| --- | --- | --- |
| `animate-fade-up` | 0.6s | Section reveals |
| `animate-shimmer` | 3s loop | Skeleton loaders |
| `animate-pulse-glow` | 2.4s loop | Live elements (play buttons, &ldquo;live&rdquo; indicators) |
| `animate-marquee` | 40s loop | Press logos strip |
| `animate-float` | 6s loop | Floating hero widgets |
| `animate-gradient-pan` | 12s loop | Gradient text on premium CTAs |

### Parallax

- Only the **hero image** and the **back grid** parallax. Nothing else.
- The hero image moves **−80px** over the scroll range, the back grid **+60px**.
- Disabled on mobile under 768px and when `prefers-reduced-motion` is set.

### Micro-interactions

- Cards lift **−4px** on hover with a `transition-all` of 200ms.
- Buttons gain a **subtle gradient shift** under hover (opacity 90%).
- The sparkle icon in CTAs rotates **+12°** on group hover.
- The recovery ring strokes itself in on load using `animate-ring-progress`.

---

## 6. Photography &amp; illustration

### Photography

| Trait | Direction |
| --- | --- |
| Subjects | Real athletes, mid-effort. No models posing on white. |
| Composition | Off-centre, with environmental context (gyms, parks, ocean, mat, wall). |
| Lighting | Natural where possible. Cool morning light over warm artificial light. |
| Colour grading | Lifted blacks, slightly cool whites. Saturation pulled back from default. |
| Treatment | Always overlaid with a dark gradient — `bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent`. |
| Subjects&rsquo; ethnicity | Mirror Europe (PT, ES, FR, DE, IE, AT, IT) demographics by default. |

### Illustration

We illustrate sparingly. When we do, it&rsquo;s **abstract geometric gradients** — radial blobs, conic rings, dot grids — never characters or mascots.

### Loading states

- **Skeleton loaders** match the layout of the content they replace, never block out the whole screen.
- **Shimmer** runs left-to-right at 1.8s, opacity 4%→9%→4%.
- **Empty states** use a single lucide icon in a 14×14 rounded square with a dashed `ink-700` border and an offer to act.

### Iconography

- **lucide-react** is the only icon set we use.
- 1.5px stroke at the default 16px / 24px sizes.
- Never recolour an icon to a non-token colour.
- Don&rsquo;t mix solid and outline icons in the same view.

---

## 7. Voice &amp; tone

We have one voice and three settings — the volume changes by surface, not the personality.

### Voice (always on)

- **Specific noun &gt; vague adjective.** &ldquo;+22 W FTP&rdquo;, not &ldquo;huge gains.&rdquo;
- **Honest &gt; aspirational.** &ldquo;62% of applicants get rejected&rdquo;, not &ldquo;only the best.&rdquo;
- **Athlete-first.** Talk to the athlete in second person. Talk about coaches in third.
- **Calm.** Punctuation does the lifting, not exclamation marks or emoji.

### Tone settings

| Surface | Setting | Example |
| --- | --- | --- |
| Marketing site | **Specialist** | &ldquo;Train with the world&rsquo;s best specialists. Verified. Vetted. Yours.&rdquo; |
| Athlete dashboard | **Coach** | &ldquo;Your HRV is +4 ms above 30-day. Train hard today.&rdquo; |
| Empty states / errors | **Friend** | &ldquo;No specialists match those filters. Try a higher ceiling.&rdquo; |
| Transactional emails | **Concierge** | &ldquo;Your session with Marina is confirmed for Saturday at 09:00. The bolster is in your bag, right?&rdquo; |
| Legal / TOS | **Plain English** | &ldquo;You can cancel any time, in two taps, from settings. No retention emails.&rdquo; |

### Words we use

`specialist`, `vetted`, `verified`, `readiness`, `recovery`, `polarised`, `RPE`, `autoregulate`, `protocol`, `programme` (UK), `cohort`, `athlete`, `coach`, `intentional`, `evidence-based`, `discipline`, `practice`.

### Words we don&rsquo;t

`crush`, `smash`, `beast`, `grind`, `hustle`, `optimise yourself`, `biohack`, `transform your life`, `level up`, `journey` (unless quoting an athlete), `unlock`, `unleash`, `revolutionary`.

### Punctuation &amp; mechanics

- En-dash for ranges (10–12), em-dash for thought interruption (&mdash;).
- One-sentence paragraphs are fine when the rhythm calls for it.
- Sentence-case headlines. Sentence-case section labels (but uppercase tracked eyebrows).
- Numbers under 10 spelled out in prose; numerals in UI and stats.
- &ldquo;Curly quotes&rdquo; in body, `straight quotes` in code.

### Microcopy patterns

| Pattern | Example |
| --- | --- |
| Button — primary | Verb + noun. `Find my specialist`, `Match me in 60s`, `Start Athlete` |
| Button — secondary | Soft pair to primary. `How we vet coaches`, `See sample week` |
| CTA reassurance | Always under a primary CTA, max 12 words. `No credit card · Free 15-min intro with every coach · Cancel any time` |
| Tooltip | One sentence. End with a period. |
| Empty state | Title (≤6 words) + supporting line (≤22 words) + one clear next action. |
| Toast — success | Past-tense verb. `Booking confirmed.` `Plan updated.` |
| Toast — error | Plain English. Tell the user what to try. `Couldn&rsquo;t reach the server. Try again or check connection.` |

---

## 8. Surface system

### Cards

Three flavours, always rounded `rounded-2xl` (16px) or `rounded-3xl` (24px) for hero cards.

| Card | Class |
| --- | --- |
| **Default** | `border border-ink-800 bg-ink-900/40` |
| **Elevated** | `border border-ink-800 bg-ink-900/40 shadow-elevated` |
| **Glow** | `card-glow rounded-2xl bg-ink-900/50` (gradient border) |
| **Glass** | `glass rounded-2xl` (over busy backgrounds, like hero overlays) |
| **Highlight** | `border border-brand-400/60 bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent shadow-glow` |

### Spacing

- Section padding: `py-24` desktop, `py-16` mobile (via the `.section` utility).
- Card padding: `p-5`, `p-6`, `p-8`, `p-10` — pick by card size.
- Grid gaps: `gap-4`, `gap-6`, `gap-8`. Match horizontal and vertical when possible.

### Radius

- `rounded-md` 6px for icon containers
- `rounded-lg` 8px for small chips
- `rounded-xl` 12px for inputs, small cards, tiles
- `rounded-2xl` 16px for cards (default)
- `rounded-3xl` 24px for hero surfaces, big CTA blocks
- `rounded-full` for pills, badges, avatars

### Elevation

| Token | Use |
| --- | --- |
| `shadow-sm` | Inputs, tiny chips |
| `shadow` | Default for elevated cards |
| `shadow-elevated` | Hero floating widgets, sticky aside |
| `shadow-glow` | Premium CTAs, primary buttons on hover |

---

## 9. Patterns &amp; building blocks

### Eyebrow

Use **above** every section heading. Pairs a tiny icon with uppercase, letter-spaced text.

```tsx
<p className="eyebrow inline-flex items-center gap-1.5">
  <Sparkles className="h-3.5 w-3.5" /> Coach finder
</p>
```

### Pill stat

The unit of measure of every claim in the brand. Always present a number and a label.

```tsx
<div className="rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2.5 flex items-baseline justify-between">
  <span className="text-[10px] uppercase tracking-widest text-ink-500">
    Goals hit on time
  </span>
  <span className="font-display font-bold gradient-text">73%</span>
</div>
```

### Readiness ring

The hero widget. SVG ring with a conic gradient stroke, sized 88×88 in widgets and 96×96 in the dashboard hero card.

### Comparison row

Two-column layout with the FitConnect cell highlighted in a faint brand wash. Honesty is the format: when a competitor wins on an axis, the table shows it.

---

## 10. Naming

- Product name: **FitConnect** — one word, mixed case, &ldquo;C&rdquo; capitalised.
- Domain: **fitconnect.app** (preferred), `fitconnect.com` fallback.
- Twitter / X handle: **@fitconnect_app**
- GitHub: **@querinoz** (parent org), repo **fitconnect**.
- The methodology has a name: **The Specialist Standard™**. Always trademark-marked. Never abbreviated to &ldquo;TSS&rdquo;.
- Internal cohorts get year-letter names: **2026A**, **2026B**, etc.

---

## 11. Brand assets index

| Asset | Where |
| --- | --- |
| Logo mark (gradient pill) | `components/nav.tsx`, `components/footer.tsx` |
| Wordmark | `components/nav.tsx` |
| Hero recovery ring | `components/hero.tsx` → `<RecoveryRing>` |
| Dashboard browser frame | `components/dashboard-preview.tsx` |
| Skeleton loader | `components/ui/skeleton.tsx` |
| Empty state | `components/ui/empty-state.tsx` |
| Press marquee | `components/press-strip.tsx` |
| Comparison table | `components/comparison-table.tsx` |
| Testimonial card | `components/testimonials.tsx` |
| Coach quiz | `components/coach-quiz.tsx` |
| Athlete dashboard | `app/dashboard/page.tsx` |
| Methodology copy | `app/methodology/page.tsx` |

---

## 12. The one-line summary

> Specialist coaches, science-grade tools, calm voice. If you cut a piece of FitConnect anywhere, that should be what bleeds.
