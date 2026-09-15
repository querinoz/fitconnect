const STEPS = [
  "Install FitConnect.",
  "Open FitConnect.",
  "Sign in.",
  "Allow required permissions when the system asks.",
  "Open TRAIN.",
  "Test background behavior.",
  "Test Live Activity.",
  "Test Dynamic Island.",
  "Test HealthKit.",
  "Test Martial Arts / Fight Mode."
];

export function SetupChecklist() {
  return (
    <section
      aria-labelledby="ios-setup-heading"
      className="rounded-[var(--eos-radius-modal)] border border-white/10 bg-[var(--eos-elevated)] p-5 sm:p-6"
    >
      <h2 id="ios-setup-heading" className="font-display text-xl text-ink-50">
        iPhone 14 Pro Setup
      </h2>
      <ol className="mt-5 space-y-3">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-100">
            <span className="font-mono text-[11px] text-[var(--eos-voltline)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
