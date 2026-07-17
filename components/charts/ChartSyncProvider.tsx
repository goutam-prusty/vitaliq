"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChartSyncContextType {
  hoveredX: string | number | null;
  hoveredIndex: number | null;
  brushIndices: [number, number] | null;
  setHoveredX: (x: string | number | null) => void;
  setHoveredIndex: (index: number | null) => void;
  setBrushIndices: (indices: [number, number] | null) => void;
}

const ChartSyncContext = createContext<ChartSyncContextType | undefined>(undefined);

export function useChartSync() {
  const context = useContext(ChartSyncContext);
  if (!context) {
    throw new Error("useChartSync must be used within a ChartSyncProvider");
  }
  return context;
}

export function ChartSyncProvider({ children }: { children: ReactNode }) {
  const [hoveredX, setHoveredXState] = useState<string | number | null>(null);
  const [hoveredIndex, setHoveredIndexState] = useState<number | null>(null);
  const [brushIndices, setBrushIndicesState] = useState<[number, number] | null>(null);

  const setHoveredX = (x: string | number | null) => setHoveredXState(x);
  const setHoveredIndex = (idx: number | null) => setHoveredIndexState(idx);
  const setBrushIndices = (indices: [number, number] | null) => setBrushIndicesState(indices);

  return (
    <ChartSyncContext.Provider
      value={{
        hoveredX,
        hoveredIndex,
        brushIndices,
        setHoveredX,
        setHoveredIndex,
        setBrushIndices,
      }}
    >
      {children}
    </ChartSyncContext.Provider>
  );
}
