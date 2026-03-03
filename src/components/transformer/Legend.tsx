'use client';

import { IMPORTANCE_COLORS } from '@/types/transformer';
import { cn } from '@/lib/utils';

export function Legend() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
      <h3 className="font-medium text-sm text-slate-300">Legend</h3>
      
      {/* Component Types */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Components</p>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600" />
          <span className="text-sm text-slate-400">Attention Head</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-6 rounded-md bg-violet-900/50 border-2 border-violet-700" />
          <span className="text-sm text-slate-400">MLP Block</span>
        </div>
      </div>

      {/* Importance Levels */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Importance</p>
        {Object.entries(IMPORTANCE_COLORS).map(([level, colors]) => (
          <div key={level} className="flex items-center gap-3">
            <div className={cn(
              'w-6 h-6 rounded-full border-2',
              colors.bg,
              colors.border
            )} />
            <span className="text-sm text-slate-400 capitalize">{level}</span>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Indicators</p>
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600">
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-sm text-slate-400">Has notes</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600 ring-2 ring-primary ring-offset-2 ring-offset-slate-900" />
          <span className="text-sm text-slate-400">Selected</span>
        </div>
      </div>
    </div>
  );
}
