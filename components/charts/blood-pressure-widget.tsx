"use client";

import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[rgb(var(--panel))] border border-[rgb(var(--border))] rounded-lg p-2.5 shadow-lg text-xs leading-5 pointer-events-none">
        <p className="text-[rgb(var(--muted))] mb-1 font-semibold">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="h-2 w-2 rounded-full bg-[rgb(var(--danger))]" />
          <span className="font-semibold text-[rgb(var(--text))]">
            Systolic: {data.systolic} mmHg
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />
          <span className="font-semibold text-[rgb(var(--text))]">
            Diastolic: {data.diastolic} mmHg
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function BloodPressureWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-[rgb(var(--muted))]">No data available</div>;
  }

  // Ensure data has pressure bounds mapped for the Area chart and is sorted chronologically
  const formattedData = data.map(d => ({
    ...d,
    pressureBounds: [d.diastolic, d.systolic]
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={formattedData} margin={{ top: 15, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.25)" />
        <XAxis 
          dataKey="date" 
          tickLine={false} 
          axisLine={false} 
          minTickGap={30} 
          fontSize={10} 
          tickMargin={10}
          stroke="rgb(var(--muted))"
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          width={40} 
          fontSize={10} 
          tickMargin={8}
          stroke="rgb(var(--muted))"
          domain={[40, 180]} 
        />
        
        {/* Healthy Range Overlay: 90/60 to 120/80 */}
        <ReferenceArea y1={60} y2={120} fill="rgb(var(--accent))" fillOpacity={0.04} />
        
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(var(--border), 0.5)", strokeWidth: 1 }}
        />
        
        <Area 
          type="monotone" 
          dataKey="pressureBounds" 
          stroke="none" 
          fill="rgb(var(--danger))" 
          fillOpacity={0.10} 
          activeDot={false}
          animationDuration={500}
        />
        
        <Line 
          type="monotone" 
          dataKey="systolic" 
          stroke="rgb(var(--danger))" 
          strokeWidth={2} 
          dot={{ r: 2, fill: "rgb(var(--danger))", strokeWidth: 0 }} 
          activeDot={{ r: 4.5, strokeWidth: 0, fill: "rgb(var(--danger))" }}
          animationDuration={500}
        />
        <Line 
          type="monotone" 
          dataKey="diastolic" 
          stroke="rgb(var(--accent))" 
          strokeWidth={2} 
          dot={{ r: 2, fill: "rgb(var(--accent))", strokeWidth: 0 }} 
          activeDot={{ r: 4.5, strokeWidth: 0, fill: "rgb(var(--accent))" }}
          animationDuration={500}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
