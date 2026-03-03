'use client';

import { AttentionHead } from './AttentionHead';
import { MLPBlock } from './MLPBlock';
import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface TransformerLayerProps {
  layerIndex: number;
  isLast: boolean;
}

export function TransformerLayer({ layerIndex, isLast }: TransformerLayerProps) {
  const { config } = useTransformerStore();
  const { numHeadsPerLayer } = config;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Layer label */}
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-xs font-mono text-slate-500">
          Layer {layerIndex}
        </span>
      </div>

      {/* Layer container */}
      <div className={cn(
        'relative flex flex-col items-center gap-3 p-4 rounded-lg',
        'bg-slate-800/50 border border-slate-700',
        'transition-all duration-300 hover:border-slate-600',
        'w-full max-w-sm'
      )}>
        {/* Attention heads grid */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            Attention Heads
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[200px]">
            {Array.from({ length: numHeadsPerLayer }).map((_, headIndex) => (
              <AttentionHead
                key={headIndex}
                layerIndex={layerIndex}
                headIndex={headIndex}
              />
            ))}
          </div>
        </div>

        {/* Flow arrow */}
        <div className="flex items-center gap-2 text-slate-600">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-600" />
          <svg
            className="w-4 h-4 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-600" />
        </div>

        {/* MLP block */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            Feed Forward
          </span>
          <MLPBlock layerIndex={layerIndex} />
        </div>
      </div>

      {/* Connection to next layer */}
      {!isLast && (
        <div className="flex flex-col items-center gap-0.5 py-1">
          <div className="w-0.5 h-4 bg-gradient-to-b from-slate-600 to-slate-700" />
          <svg
            className="w-3 h-3 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </div>
  );
}
