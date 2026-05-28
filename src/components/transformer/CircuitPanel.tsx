'use client';

import { useCallback } from 'react';
import { X, Layers, Trash2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTransformerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CircuitNodeRow } from './CircuitNodeRow';
import { cn } from '@/lib/utils';

function computeConfidence(
  nodes: { denoisingScore?: number; noisingScore?: number }[]
): string {
  if (nodes.length === 0) return 'speculative';
  const allScored = nodes.every(
    (n) => n.denoisingScore !== undefined && n.noisingScore !== undefined
  );
  if (!allScored) return 'speculative';
  const avgD = nodes.reduce((s, n) => s + (n.denoisingScore ?? 0), 0) / nodes.length;
  const avgN = nodes.reduce((s, n) => s + (n.noisingScore ?? 0), 0) / nodes.length;
  if (avgD > 0.8 && avgN > 0.8) return 'verified';
  if (avgD > 0.5 && avgN > 0.5) return 'likely';
  return 'speculative';
}

const CONFIDENCE_COLORS: Record<string, string> = {
  verified: 'text-green-400 border-green-600',
  likely: 'text-amber-400 border-amber-600',
  speculative: 'text-slate-400 border-slate-600',
};

export function CircuitPanel() {
  const {
    circuits,
    activeCircuitId,
    setActiveCircuit,
    circuitBuildMode,
    toggleCircuitBuildMode,
    removeCircuitNode,
    deleteCircuit,
    reorderCircuitNodes,
  } = useTransformerStore();

  const circuit = circuits.find((c) => c.id === activeCircuitId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over || active.id === over.id || !circuit) return;
      const oldIds = circuit.nodes.map((n) => n.id);
      const oldIndex = oldIds.indexOf(String(active.id));
      const newIndex = oldIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = [...oldIds];
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, String(active.id));
      reorderCircuitNodes(circuit.id, reordered);
    },
    [circuit, reorderCircuitNodes]
  );

  if (!circuit) return null;

  const confidence = computeConfidence(circuit.nodes);

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-[rgba(0,188,212,0.15)] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-100 truncate flex-1">
            {circuit.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1 flex-shrink-0"
            onClick={() => setActiveCircuit(null)}
            aria-label="Close circuit panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
            {circuit.circuitType}
          </span>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 border rounded',
              CONFIDENCE_COLORS[confidence]
            )}
          >
            {confidence}
          </span>
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: circuit.color }}
          />
        </div>

        {/* Build mode toggle */}
        <Button
          variant={circuitBuildMode ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'w-full h-7 text-xs',
            circuitBuildMode
              ? 'bg-[#00bcd4] text-[#0a0e14] hover:bg-[#00bcd4]/90'
              : 'border-[rgba(0,188,212,0.3)] text-[#00bcd4] hover:bg-[rgba(0,188,212,0.1)]'
          )}
          onClick={toggleCircuitBuildMode}
        >
          <Layers className="h-3 w-3 mr-1.5" />
          {circuitBuildMode ? 'Stop adding nodes' : 'Add nodes'}
        </Button>
      </div>

      {/* Node list */}
      <ScrollArea className="flex-1 p-3">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">
          Nodes ({circuit.nodes.length}) — drag to reorder
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={circuit.nodes.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {circuit.nodes.map((node, i) => (
                <CircuitNodeRow
                  key={node.id}
                  node={node}
                  index={i}
                  circuitId={circuit.id}
                  onRemove={removeCircuitNode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {circuitBuildMode && (
          <div className="mt-2 py-2 text-center text-[10px] text-slate-600 border border-dashed border-slate-700 rounded">
            Click any component to add node {circuit.nodes.length}
          </div>
        )}
      </ScrollArea>

      {/* Delete */}
      <div className="p-3 border-t border-slate-800">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-red-900 text-red-400 hover:bg-red-950"
            >
              <Trash2 className="h-3 w-3 mr-1.5" />
              Delete circuit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{circuit.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the circuit and all {circuit.nodes.length} nodes.
                Cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCircuit(circuit.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
