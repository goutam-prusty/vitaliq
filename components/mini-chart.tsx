"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AppSettings, HealthRecord } from "@/lib/types";
import { extractTimeSeries } from "@/core/analytics/engine";
import { weightFromKg } from "@/lib/units";

export function MiniChart({ records, settings }: { records: HealthRecord[]; settings: AppSettings }) {
  const data = extractTimeSeries(records, "weightKg").slice(-30).map((point) => ({
    date: point.date,
    value: weightFromKg(point.value, settings.preferredWeightUnit)
  }));
  if (!data.length) return <p className="py-12 text-center text-sm text-[rgb(var(--muted))]">No weight readings yet.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} width={42} fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip contentStyle={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }} />
          <Line type="monotone" dataKey="value" stroke="rgb(var(--accent))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
