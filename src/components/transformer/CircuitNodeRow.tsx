'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';
import type { PathNodeData } from '@/types/transformer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ROLES = ['source', 'relay', 'amplifier', 'inhibitor', 'sink'] as const;
const SIGNAL_TYPES = ['positional', 'content', 'name', 'fact', 'pattern'] as const;

interface CircuitNodeRowProps {
  node: PathNodeData;
  index: number;
  circuitId: string;
  onRemove: (index: number) => void;
}

export function CircuitNodeRow({ node, index, circuitId, onRemove }: CircuitNodeRowProps) {
  const { updateCircuitNode } = useTransformerStore();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const label =
    node.componentType === 'mlp'
      ? `L${node.layerIndex}_MLP`
      : node.headIndex !== undefined
      ? `L${node.layerIndex}_H${node.headIndex}`
      : `L${node.layerIndex}_? (click to assign)`;

  const isAssigned = node.headIndex !== undefined || node.componentType === 'mlp';

  const update = (data: Partial<PathNodeData>) =>
    updateCircuitNode(circuitId, node.id, data);

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900 border border-slate-700 rounded-md p-2 space-y-1.5">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className="text-[10px] text-slate-600 w-4">{index}</span>
        <span
          className={cn(
            'font-mono text-xs flex-1',
            isAssigned ? 'text-[#00bcd4]' : 'text-slate-500 italic'
          )}
        >
          {label}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="text-slate-600 hover:text-red-400 transition-colors"
          aria-label="Remove node"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Role + signal type */}
      <div className="grid grid-cols-2 gap-1">
        <Select value={node.role ?? ''} onValueChange={(v) => update({ role: v })}>
          <SelectTrigger className="h-6 text-[10px] bg-slate-800 border-slate-700">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} className="text-xs">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={node.signalType ?? ''} onValueChange={(v) => update({ signalType: v })}>
          <SelectTrigger className="h-6 text-[10px] bg-slate-800 border-slate-700">
            <SelectValue placeholder="Signal" />
          </SelectTrigger>
          <SelectContent>
            {SIGNAL_TYPES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Patching scores */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-slate-600 w-4">D:</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={node.denoisingScore ?? ''}
          onChange={(e) =>
            update({ denoisingScore: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="h-5 w-14 text-[10px] bg-slate-800 border-slate-700 px-1"
          placeholder="0.0"
        />
        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(node.denoisingScore ?? 0) * 100}%` }}
          />
        </div>
        <span className="text-slate-600 w-4">N:</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={node.noisingScore ?? ''}
          onChange={(e) =>
            update({ noisingScore: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="h-5 w-14 text-[10px] bg-slate-800 border-slate-700 px-1"
          placeholder="0.0"
        />
        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(node.noisingScore ?? 0) * 100}%` }}
          />
        </div>
      </div>

      {/* AND/OR edge label */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-slate-600">next:</span>
        {(['and', 'or', undefined] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => update({ connectionType: v })}
            className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] transition-all',
              node.connectionType === v
                ? 'border-[#00bcd4] text-[#00bcd4] bg-[rgba(0,188,212,0.1)]'
                : 'border-slate-700 text-slate-500 hover:border-slate-500'
            )}
          >
            {v ?? '—'}
          </button>
        ))}
      </div>
    </div>
  );
}
