"use client";

import { ComposedChart, Area, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface LineChartWidgetProps {
  data: any[];
  dataKey: string;
  color: string;
  unit: string;
  movingAverageDataKey?: string;
  goalValue?: number;
  goalLabel?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[rgb(var(--panel))] border border-[rgb(var(--border))] rounded-lg p-2.5 shadow-lg text-xs leading-5 pointer-events-none">
        <p className="text-[rgb(var(--muted))] mb-1 font-semibold">{label}</p>
        {payload.map((item: any, idx: number) => {
          const isMA = item.name === "movingAverage";
          return (
            <div key={idx} className="flex items-center gap-2 mt-0.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: isMA ? "rgb(var(--warn))" : item.color }} />
              <span className="font-semibold text-[rgb(var(--text))]">
                {isMA ? "7-Day Avg" : "Value"}: {Number(item.value).toFixed(1)}{unit ? ` ${unit}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function LineChartWidget({
  data,
  dataKey,
  color,
  unit,
  movingAverageDataKey,
  goalValue,
  goalLabel
}: LineChartWidgetProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-[rgb(var(--muted))]">No data available</div>;
  }

  // Safe sort to ensure dates flow chronologically for gradient area computation
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={sortedData} margin={{ top: 15, right: 10, bottom: 5, left: -10 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.12} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          domain={["dataMin - 1", "dataMax + 1"]} 
        />
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: "rgba(var(--border), 0.5)", strokeWidth: 1 }}
        />
        
        {goalValue !== undefined && (
          <ReferenceLine 
            y={goalValue} 
            stroke="rgb(var(--warn))" 
            strokeDasharray="4 4" 
            label={{ value: goalLabel || "Goal", fontSize: 10, fill: "rgb(var(--warn))", position: "insideBottomLeft", offset: 10 }} 
          />
        )}

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="none"
          fill={`url(#gradient-${dataKey})`}
          activeDot={false}
          animationDuration={500}
        />
        
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2} 
          dot={{ r: 2, fill: color, strokeWidth: 0 }} 
          activeDot={{ r: 4.5, strokeWidth: 0, fill: color }} 
          animationDuration={500}
        />
        
        {movingAverageDataKey && (
          <Line 
            type="monotone" 
            dataKey={movingAverageDataKey} 
            stroke="rgb(var(--warn))" 
            strokeWidth={1.5} 
            dot={false}
            activeDot={false}
            animationDuration={500}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
