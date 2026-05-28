'use client';

import { useTransformerStore } from '@/lib/store';

export function CircuitBuildBanner() {
  const { activeCircuitId, circuitBuildMode, circuits } = useTransformerStore();
  const circuit = circuits.find((c) => c.id === activeCircuitId);

  if (!circuitBuildMode || !circuit) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-[rgba(0,188,212,0.4)] bg-[rgba(0,188,212,0.1)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00bcd4] animate-pulse flex-shrink-0" />
      <span className="text-xs text-[#00bcd4] truncate max-w-[180px]">
        Adding nodes to: {circuit.name}
      </span>
      <span className="text-xs text-slate-500 flex-shrink-0">Esc to stop</span>
    </div>
  );
}
