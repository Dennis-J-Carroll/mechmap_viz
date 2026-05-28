'use client';

import { Plus } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CircuitListProps {
  onNewCircuit: () => void;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  verified: 'bg-green-500',
  likely: 'bg-amber-500',
  speculative: 'bg-slate-500',
};

export function CircuitList({ onNewCircuit }: CircuitListProps) {
  const { circuits, activeCircuitId, setActiveCircuit, currentProject } = useTransformerStore();

  if (!currentProject) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider">
          Circuits
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-[#00bcd4] hover:text-[#00bcd4] hover:bg-[rgba(0,188,212,0.1)]"
          onClick={onNewCircuit}
          aria-label="Create new circuit"
          title="New circuit (C)"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {circuits.length === 0 && (
        <p className="text-[10px] text-slate-600 text-center py-2">
          No circuits yet. Press C to create one.
        </p>
      )}

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {circuits.map((circuit) => {
          const isActive = circuit.id === activeCircuitId;
          return (
            <button
              key={circuit.id}
              onClick={() => setActiveCircuit(isActive ? null : circuit.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all text-left',
                isActive
                  ? 'border-l-2 border-[#00bcd4] bg-[rgba(0,188,212,0.08)] text-slate-200'
                  : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: circuit.color }}
              />
              <span className="flex-1 truncate">{circuit.name}</span>
              <span className="text-[9px] text-slate-600 flex-shrink-0">
                {circuit.circuitType}
              </span>
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  CONFIDENCE_COLORS[circuit.confidence] ?? 'bg-slate-600'
                )}
                title={circuit.confidence}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
