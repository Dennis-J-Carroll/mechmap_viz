'use client';

import { useState } from 'react';
import { useTransformerStore } from '@/lib/store';
import type { CreateCircuitInput } from '@/types/transformer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DJC_PALETTE = [
  '#00bcd4', '#f59e0b', '#7c4dff', '#f43f5e', '#10b981', '#6366f1',
];

const CIRCUIT_TYPES = [
  'induction', 'factual_recall', 'copy', 'inhibition', 'boosting', 'custom',
];

const TEMPLATES = {
  induction: {
    label: 'Induction Circuit',
    description: '2 nodes: Previous Token Head → Induction Head. Pre-fills role + signalType.',
    nodes: [
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'relay', signalType: 'positional' },
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'sink', signalType: 'pattern' },
    ],
  },
  ioi: {
    label: 'IOI Name Mover',
    description: '5 nodes: S2 Inhibition → Name Mover → Backup NM → Negative NM → Output.',
    nodes: [
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'inhibitor', signalType: 'name' },
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'relay', signalType: 'name' },
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'relay', signalType: 'name' },
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'inhibitor', signalType: 'name' },
      { componentType: 'attention_head' as const, layerIndex: 0, role: 'sink', signalType: 'name' },
    ],
  },
  blank: {
    label: 'Blank',
    description: 'Start empty. Add nodes by clicking components in build mode.',
    nodes: [] as { componentType: 'attention_head' | 'mlp'; layerIndex: number; role?: string; signalType?: string }[],
  },
} as const;

interface CircuitTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CircuitTemplates({ open, onOpenChange }: CircuitTemplatesProps) {
  const { createCircuit, setActiveCircuit } = useTransformerStore();
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>('induction');
  const [name, setName] = useState('');
  const [circuitType, setCircuitType] = useState('induction');
  const [color, setColor] = useState(DJC_PALETTE[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const input: CreateCircuitInput = {
      name: name.trim(),
      circuitType,
      color,
      templateNodes: TEMPLATES[template].nodes.map((n) => ({
        componentType: n.componentType,
        layerIndex: n.layerIndex,
        role: n.role,
        signalType: n.signalType,
      })),
    };
    const circuit = await createCircuit(input);
    setLoading(false);
    if (circuit) {
      setActiveCircuit(circuit.id);
      onOpenChange(false);
      setName('');
      setTemplate('induction');
      setCircuitType('induction');
      setColor(DJC_PALETTE[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-[rgba(0,188,212,0.2)]">
        <DialogHeader>
          <DialogTitle>New Circuit</DialogTitle>
          <DialogDescription>
            Choose a template to start from, then name and configure your circuit.
          </DialogDescription>
        </DialogHeader>

        {/* Template picker */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(TEMPLATES) as [keyof typeof TEMPLATES, typeof TEMPLATES[keyof typeof TEMPLATES]][]).map(
            ([key, tpl]) => (
              <button
                key={key}
                onClick={() => {
                  setTemplate(key);
                  if (key !== 'blank') setCircuitType(key === 'ioi' ? 'copy' : key);
                }}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  template === key
                    ? 'border-[#00bcd4] bg-[rgba(0,188,212,0.08)] text-slate-100'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                )}
              >
                <p className="text-xs font-medium mb-1">{tpl.label}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{tpl.description}</p>
              </button>
            )
          )}
        </div>

        {/* Name + config */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Circuit name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Induction Circuit L1-L5"
              className="bg-slate-800 border-slate-700"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <Select value={circuitType} onValueChange={setCircuitType}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CIRCUIT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Color</label>
            <div className="flex gap-2">
              {DJC_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110'
                      : 'opacity-70 hover:opacity-100'
                  )}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            style={{ background: color, color: '#0a0e14' }}
          >
            {loading ? 'Creating...' : 'Create Circuit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
