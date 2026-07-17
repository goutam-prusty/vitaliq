"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({ data, color = "rgb(var(--accent))" }: { data: number[]; color?: string }) {
  if (data.length <= 1) {
    return <span className="text-[rgb(var(--muted))] text-xs font-normal">No trend</span>;
  }
  const points = data.map((v, i) => ({ index: i, value: v }));
  return (
    <div className="h-6 w-16 opacity-85">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5} 
            dot={false} 
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
