'use client';

import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const IMPORTANCE_LEVELS = ['high', 'medium', 'low', 'unknown'] as const;
const IMPORTANCE_COLORS: Record<string, string> = {
  high: 'border-red-500 text-red-400',
  medium: 'border-amber-500 text-amber-400',
  low: 'border-green-500 text-green-400',
  unknown: 'border-slate-500 text-slate-400',
};

export function FilterPanel() {
  const {
    annotations,
    filterImportance,
    filterTags,
    matchingKeys,
    toggleFilterImportance,
    toggleFilterTag,
    clearFilters,
    filterQuery,
  } = useTransformerStore();

  // Collect all unique tags from annotations
  const allTags = Array.from(
    new Set(Object.values(annotations).flatMap((a) => a.tags))
  ).sort();

  const hasFilters = filterQuery || filterImportance.length > 0 || filterTags.length > 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Importance toggles */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Importance</p>
        <div className="flex flex-wrap gap-1">
          {IMPORTANCE_LEVELS.map((level) => {
            const active = filterImportance.includes(level);
            return (
              <button
                key={level}
                onClick={() => toggleFilterImportance(level)}
                className={cn(
                  'px-2 py-0.5 text-xs rounded border transition-all',
                  active
                    ? cn(IMPORTANCE_COLORS[level], 'bg-slate-700')
                    : 'border-slate-700 text-slate-500 hover:border-slate-500'
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tags</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {allTags.map((tag) => {
              const active = filterTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilterTag(tag)}
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] rounded border transition-all',
                    active
                      ? 'border-[#00bcd4] text-[#00bcd4] bg-[rgba(0,188,212,0.1)]'
                      : 'border-slate-700 text-slate-500 hover:border-slate-500'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Match count */}
      {hasFilters && (
        <p className="text-[10px] text-slate-500">
          {matchingKeys.size} component{matchingKeys.size !== 1 ? 's' : ''} match
        </p>
      )}
    </div>
  );
}
