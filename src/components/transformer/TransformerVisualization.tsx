'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTransformerStore } from '@/lib/store';
import { TransformerLayer } from './TransformerLayer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { HeatmapView } from './HeatmapView';
import { BatchToolbar } from './BatchToolbar';

export function TransformerVisualization() {
  const { config, view } = useTransformerStore();
  const { numLayers, modelName } = config;
  const kbFocus = useRef({ layer: 0, head: 0, isMlp: false });

  const focusComponent = useCallback(() => {
    const { layer, head, isMlp } = kbFocus.current;
    const selector = isMlp
      ? `#layer-${layer} button[aria-label^="Layer ${layer}, MLP"]`
      : `#layer-${layer} button[aria-label^="Layer ${layer}, Head ${head}"]`;
    const btn = document.querySelector<HTMLButtonElement>(selector);
    btn?.focus();
    btn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const inViz = activeEl?.closest('[role="main"]');
      if (!inViz) return;

      const { numLayers: layers, numHeadsPerLayer: heads } = config;
      const kb = kbFocus.current;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          kb.layer = Math.max(0, kb.layer - 1);
          focusComponent();
          break;
        case 'ArrowDown':
          e.preventDefault();
          kb.layer = Math.min(layers - 1, kb.layer + 1);
          focusComponent();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!kb.isMlp && kb.head < heads - 1) {
            kb.head++;
          } else if (!kb.isMlp) {
            kb.isMlp = true;
          }
          focusComponent();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (kb.isMlp) {
            kb.isMlp = false;
            kb.head = heads - 1;
          } else {
            kb.head = Math.max(0, kb.head - 1);
          }
          focusComponent();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, focusComponent]);

  if (view === 'heatmap') {
    return <HeatmapView />;
  }

  return (
    <div className="flex flex-col h-full">
      <BatchToolbar />
      <div className="flex flex-col items-center flex-1 overflow-y-auto">
        {/* Model Header */}
        <div className="flex items-center gap-3 py-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-600" />
          <h1 className="text-xl font-bold text-slate-200">{modelName}</h1>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-600" />
        </div>

        {/* Input Embeddings */}
        <div className="flex flex-col items-center gap-1 pb-4">
          <div className={cn(
            'px-4 py-2 rounded-lg border border-emerald-700 bg-emerald-900/30',
            'text-emerald-400 text-sm font-medium'
          )}>
            Input Embeddings
          </div>
          <div className="flex flex-col items-center gap-0.5 py-1">
            <svg
              className="w-4 h-4 text-slate-600 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <div className="w-0.5 h-3 bg-gradient-to-b from-slate-600 to-slate-700" />
          </div>
        </div>

        {/* Layers */}
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-0 pb-4">
            {Array.from({ length: numLayers }).map((_, index) => (
              <TransformerLayer
                key={index}
                layerIndex={index}
                isLast={index === numLayers - 1}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Output */}
        <div className="flex flex-col items-center gap-1 pt-2 pb-4">
          <div className="flex flex-col items-center gap-0.5 py-1">
            <div className="w-0.5 h-3 bg-gradient-to-b from-slate-700 to-slate-600" />
            <svg
              className="w-4 h-4 text-slate-600 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className={cn(
            'px-4 py-2 rounded-lg border border-blue-700 bg-blue-900/30',
            'text-blue-400 text-sm font-medium'
          )}>
            Output (Logits)
          </div>
        </div>
      </div>
    </div>
  );
}
