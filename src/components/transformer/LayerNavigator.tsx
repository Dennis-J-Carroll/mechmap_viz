'use client';

import { useTransformerStore } from '@/lib/store';

export function LayerNavigator() {
  const { config, annotations } = useTransformerStore();
  const { numLayers, numHeadsPerLayer } = config;

  const scrollToLayer = (layerIndex: number) => {
    const el = document.getElementById(`layer-${layerIndex}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
        Layers
      </h3>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {Array.from({ length: numLayers }).map((_, l) => {
          const counts = { high: 0, medium: 0, low: 0, unknown: 0 };
          for (let h = 0; h < numHeadsPerLayer; h++) {
            const ann = annotations[`head-layer-${l}-head-${h}`];
            if (ann) counts[ann.importance as keyof typeof counts]++;
          }
          const mlpAnn = annotations[`mlp-layer-${l}`];
          if (mlpAnn) counts[mlpAnn.importance as keyof typeof counts]++;
          const total = counts.high + counts.medium + counts.low + counts.unknown;

          return (
            <button
              key={l}
              onClick={() => scrollToLayer(l)}
              className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-xs hover:bg-slate-700/50 transition-colors group text-left"
            >
              <span className="font-mono text-slate-500 w-6 flex-shrink-0 group-hover:text-slate-300">
                L{l}
              </span>
              {total > 0 ? (
                <div className="flex-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-slate-700">
                  {counts.high > 0 && (
                    <div className="bg-red-500 h-full" style={{ flex: counts.high }} />
                  )}
                  {counts.medium > 0 && (
                    <div className="bg-amber-500 h-full" style={{ flex: counts.medium }} />
                  )}
                  {counts.low > 0 && (
                    <div className="bg-green-500 h-full" style={{ flex: counts.low }} />
                  )}
                  {counts.unknown > 0 && (
                    <div className="bg-slate-500 h-full" style={{ flex: counts.unknown }} />
                  )}
                </div>
              ) : (
                <div className="flex-1 h-1.5 rounded-full bg-slate-800" />
              )}
              <span className="text-[10px] text-slate-600 w-4 text-right">
                {total > 0 ? total : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
