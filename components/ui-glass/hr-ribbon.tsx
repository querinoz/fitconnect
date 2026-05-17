type Props = {
  data: number[];
  className?: string;
};

export function HRRibbon({ data, className = "" }: Props) {
  const max = Math.max(...data, 1);
  return (
    <div className={`flex items-end gap-1 h-12 ${className}`}>
      {data.map((v, i) => (
        <span
          key={i}
          data-bar=""
          className="flex-1 rounded-sm bg-grad-pulse transition-all min-h-[4px]"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
