export default function AthleteDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 p-4 sm:p-6">
      <div className="h-8 w-48 rounded-lg bg-ink-800/80" />
      <div className="h-4 w-72 rounded bg-ink-800/60" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-40 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800 md:col-span-2" />
        <div className="h-40 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800" />
        <div className="h-56 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800 xl:col-span-2" />
        <div className="h-56 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800" />
      </div>
    </div>
  );
}
