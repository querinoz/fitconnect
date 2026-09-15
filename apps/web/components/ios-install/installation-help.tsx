const SCAN_STEPS = [
  "Open your iPhone camera.",
  "Point it at the QR code.",
  "Tap the FitConnect link.",
  "Install TestFlight if required.",
  "Install FitConnect.",
  "Open FitConnect."
];

export function InstallationHelp() {
  return (
    <section aria-labelledby="ios-scan-heading">
      <h2 id="ios-scan-heading" className="font-display text-xl text-ink-50">
        How to install
      </h2>
      <ol className="mt-4 space-y-2 text-sm leading-relaxed text-ink-100">
        {SCAN_STEPS.map((step, index) => (
          <li key={step}>
            <span className="font-mono text-[11px] text-[var(--eos-telemetry)]">
              {index + 1}.
            </span>{" "}
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DeviceCompatibility({ isAppleMobile }: { isAppleMobile: boolean }) {
  return (
    <p className="text-sm text-ink-300" data-testid="ios-device-hint">
      {isAppleMobile
        ? "Open the installation link on this iPhone or iPad."
        : "Scan this QR code with your iPhone. Android and desktop can still open this page."}
    </p>
  );
}

export function CapabilityNotes() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section
        aria-labelledby="ios-train-heading"
        className="rounded-[var(--eos-radius-modal)] border border-white/10 bg-[var(--eos-elevated)] p-5"
      >
        <h2 id="ios-train-heading" className="font-display text-lg text-ink-50">
          TRAIN
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          The FitConnect iOS app includes live workout, background workout, Lock
          Screen Live Activity, and Dynamic Island surfaces. Those flows are
          proven in source; they are not claimed for a TestFlight build until
          that build is actually installed.
        </p>
        <ul className="mt-4 space-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--eos-voltline)]">
          <li>Live workout</li>
          <li>Background workout</li>
          <li>Lock Screen</li>
          <li>Live Activity</li>
          <li>Dynamic Island</li>
        </ul>
      </section>
      <section
        aria-labelledby="ios-health-heading"
        className="rounded-[var(--eos-radius-modal)] border border-white/10 bg-[var(--eos-elevated)] p-5"
      >
        <h2 id="ios-health-heading" className="font-display text-lg text-ink-50">
          HealthKit
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          Permission sheets appear only when TRAIN, recovery, or workout
          recording needs them. FitConnect does not say HealthKit is connected
          until you authorize. Missing samples stay missing.
        </p>
      </section>
      <section
        aria-labelledby="ios-combat-heading"
        className="rounded-[var(--eos-radius-modal)] border border-white/10 bg-[var(--eos-elevated)] p-5 md:col-span-2"
      >
        <h2 id="ios-combat-heading" className="font-display text-lg text-ink-50">
          Combat / Martial Arts
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          Fight Mode includes round timer, rest, pause, resume, and session
          completion. Device motion is not punch force. FitConnect does not
          advertise unvalidated force measurement.
        </p>
      </section>
    </div>
  );
}
