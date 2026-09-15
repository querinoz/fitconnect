export function BuildStatus({
  version,
  build,
  betaStatus
}: {
  version: string | null;
  build: string | null;
  betaStatus: string | null;
}) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Version", value: version ?? "Not configured" },
    { label: "Build", value: build ?? "Not configured" },
    { label: "Distribution", value: "TestFlight" },
    { label: "Status", value: betaStatus ?? "Not configured" }
  ];

  return (
    <section
      aria-labelledby="ios-build-heading"
      className="rounded-[var(--eos-radius-modal)] border border-white/10 bg-[var(--eos-elevated)] p-5 sm:p-6"
    >
      <h2 id="ios-build-heading" className="font-display text-xl text-ink-50">
        Current iOS build
      </h2>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
        Build information
      </p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-white/10 pt-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm text-ink-50">{row.value}</dd>
          </div>
        ))}
      </dl>
      {!version && !build && !betaStatus ? (
        <p className="mt-4 text-sm text-ink-300" role="status">
          BUILD INFORMATION NOT CONFIGURED
        </p>
      ) : null}
    </section>
  );
}
