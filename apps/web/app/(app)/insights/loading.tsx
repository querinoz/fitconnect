export default function InsightsLoading() {
  return (
    <div className="mx-auto max-w-[88rem] space-y-4 p-4 sm:p-6">
      <div className="h-14 animate-pulse rounded-[var(--eos-radius-card)] bg-eos-elevated motion-reduce:animate-none" />
      <div className="grid gap-4 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-[2fr_1fr]">
        <div className="h-64 animate-pulse rounded-[var(--eos-radius-card)] bg-eos-carbon motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-[var(--eos-radius-card)] bg-eos-carbon motion-reduce:animate-none" />
      </div>
    </div>
  );
}
