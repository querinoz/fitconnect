type Props = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

export function SparkLine({ values, width = 96, height = 24, className }: Props) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 0.0001);
  const step = width / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / span) * height}`)
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="sl-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--volt-400)" />
          <stop offset="100%" stopColor="var(--volt-500)" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="url(#sl-grad)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
