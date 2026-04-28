"use client";

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
  size?: number;
}

export default function DonutChart({ data, title, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-sm">No data available</p>
      </div>
    );
  }

  // Build conic-gradient segments
  let cumulative = 0;
  const segments = data.map((d) => {
    const start = cumulative;
    const pct = (d.value / total) * 100;
    cumulative += pct;
    return `${d.color} ${start}% ${cumulative}%`;
  });

  const gradient = `conic-gradient(${segments.join(", ")})`;

  return (
    <div>
      {title && <h3 className="text-sm font-semibold mb-4">{title}</h3>}
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div
          className="shrink-0 rounded-full relative"
          style={{
            width: size,
            height: size,
            background: gradient,
          }}
        >
          {/* Inner hole */}
          <div
            className="absolute rounded-full bg-background"
            style={{
              width: size * 0.6,
              height: size * 0.6,
              top: size * 0.2,
              left: size * 0.2,
            }}
          >
            <div className="flex h-full items-center justify-center flex-col">
              <span className="text-lg font-bold">{total}</span>
              <span className="text-[10px] text-muted">Total</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 min-w-0">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-muted truncate flex-1">
                {d.label}
              </span>
              <span className="text-xs font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
