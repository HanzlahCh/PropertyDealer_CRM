"use client";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  maxValue?: number;
}

const defaultColors = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#818cf8",
  "#7c3aed",
];

export default function BarChart({ data, title, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-24 text-xs text-muted truncate text-right">
              {item.label}
            </div>
            <div className="flex-1 h-7 rounded-lg bg-white/5 overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max((item.value / max) * 100, 2)}%`,
                  backgroundColor: item.color || defaultColors[i % defaultColors.length],
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
