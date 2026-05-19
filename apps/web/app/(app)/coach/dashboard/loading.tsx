export default function CoachDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 p-4 sm:p-6">
      <div className="h-8 w-56 rounded-lg bg-ink-800/80" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-64 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800 xl:col-span-2" />
        <div className="h-64 rounded-2xl bg-ink-900/80 ring-1 ring-ink-800" />
      </div>
    </div>
  );
}
