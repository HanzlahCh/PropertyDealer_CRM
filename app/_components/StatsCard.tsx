import React from "react";

type Props = {
  title: string;
  value: string | number;
  delta?: string;
};

export default function StatsCard({ title, value, delta }: Props) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="text-sm text-muted">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {delta && <div className="text-sm text-muted">{delta}</div>}
    </div>
  );
}
