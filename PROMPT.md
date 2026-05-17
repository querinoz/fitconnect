# FitConnect — Build specification

Agent instructions for implementing and validating FitConnect. Complete each phase in order unless the user directs otherwise.

---

# PHASE 11 — ROLE DASHBOARD CONSISTENCY & LANDING PAGE PREVIEW VALIDATION

You MUST deeply validate the UX/UI consistency between the Athlete dashboard and Coach dashboard.

The application MUST provide:

* visual consistency
* design system consistency
* responsive consistency
* navigation consistency
* shared component consistency
* branding consistency
* feature parity where applicable

The landing page MUST contain a clearly visible interactive preview section with tabs allowing users to switch between:

* Athlete Dashboard Preview
* Coach Dashboard Preview

This section MUST:

* be highly visible above the fold or in a premium showcase section
* have smooth transitions/animations
* accurately preview real dashboard UI
* use production-quality mock/live data
* be fully responsive
* work on desktop/tablet/mobile
* maintain identical design language between both dashboards
* visually communicate the relationship between Athlete and Coach ecosystems

---

# DASHBOARD CONSISTENCY AUDIT

Perform a full UI/UX audit between Athlete and Coach dashboards.

Analyze:

## Visual Consistency

* typography
* spacing
* colors
* shadows
* border radius
* iconography
* cards
* buttons
* tables
* charts
* navigation
* responsiveness
* dark/light themes

## UX Consistency

* navigation flow
* onboarding
* menu behavior
* loading states
* empty states
* error states
* animations
* accessibility
* interaction patterns

## Component System Validation

Ensure both dashboards share:

* same design system
* reusable components
* reusable layout patterns
* shared tokens
* shared Tailwind/theme configs
* shared UI primitives

Detect:

* duplicated UI code
* inconsistent layouts
* inconsistent spacing
* inconsistent colors
* inconsistent states
* inconsistent responsiveness

---

# LANDING PAGE EXPERIENCE AUDIT

Audit the landing page as a conversion-focused SaaS/product homepage.

Validate:

* hero section
* CTA visibility
* dashboard preview visibility
* mobile responsiveness
* animation quality
* performance
* accessibility
* perceived product quality
* modern SaaS aesthetics
* visual hierarchy
* product storytelling

The dashboard preview section MUST:

* feel premium
* resemble elite SaaS products
* communicate platform power immediately
* increase conversion trust
* showcase both user roles clearly

Reference-quality inspiration:

* Linear
* Vercel
* Stripe
* Notion
* Figma

---

# REQUIRED IMPLEMENTATION

If missing, automatically implement:

## Landing Page Dashboard Preview Tabs

Create:

* Athlete tab
* Coach tab

With:

* animated switching
* responsive layout
* polished transitions
* real dashboard previews
* matching UI language
* synchronized design system

---

# DESIGN SYSTEM ENFORCEMENT

Enforce:

* unified component architecture
* centralized theme system
* shared tokens
* consistent spacing scale
* responsive breakpoints
* accessibility standards
* consistent interaction states

---

# FINAL VALIDATION

Before completion, verify:

* Athlete dashboard matches Coach dashboard visually
* both dashboards feel like the same ecosystem
* landing page preview tabs work correctly
* previews are responsive
* previews are visually premium
* no broken layouts
* no inconsistent components
* no mobile responsiveness issues
* no accessibility violations
* no hydration/rendering issues
* animations are smooth
* Lighthouse score is high
* UX feels production-grade

If inconsistencies exist:

* automatically refactor
* unify
* optimize
* modernize
* standardize

Do not leave partially matched dashboards.

The final experience MUST feel cohesive, premium, modern, and enterprise-grade.
