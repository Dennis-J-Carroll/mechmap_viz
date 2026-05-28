'use client';

import { cn } from '@/lib/utils';
import { useTransformerStore } from '@/lib/store';
import { IMPORTANCE_COLORS, SelectedComponent } from '@/types/transformer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MLPBlockProps {
  layerIndex: number;
}

export function MLPBlock({ layerIndex }: MLPBlockProps) {
  const { selectedComponent, setSelectedComponent, annotations, getAnnotationKey, matchingKeys, filterQuery, filterImportance, filterTags, batchMode, batchSelected, toggleBatchComponent } = useTransformerStore();
  
  const componentId: SelectedComponent = {
    type: 'mlp',
    layerIndex,
  };
  
  const key = getAnnotationKey(componentId);
  const annotation = annotations[key];
  const isSelected = selectedComponent?.type === 'mlp' &&
    selectedComponent.layerIndex === layerIndex;

  const hasActiveFilters = !!(filterQuery || filterImportance.length > 0 || filterTags.length > 0);
  const isFiltered = hasActiveFilters && !!annotation && !matchingKeys.has(key);

  const importanceColors = annotation ? IMPORTANCE_COLORS[annotation.importance] : null;

  const isBatchSelected = batchSelected.has(key);

  const handleClick = (e: React.MouseEvent) => {
    if (batchMode) {
      toggleBatchComponent(key);
      return;
    }
    setSelectedComponent(componentId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            aria-label={`Layer ${layerIndex}, MLP${
              annotation
                ? ` — ${annotation.importance}${annotation.tags.length > 0 ? ` — ${annotation.tags.join(', ')}` : ''}`
                : ' — unannotated'
            }`}
            aria-pressed={isSelected}
            className={cn(
              'relative w-16 h-10 rounded-md transition-all duration-200',
              'border-2 flex items-center justify-center',
              'hover:scale-105 hover:shadow-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
              // Default styling
              !annotation && 'bg-violet-900/50 border-violet-700 hover:border-violet-500',
              // Has annotation styling
              annotation && [
                importanceColors?.bg,
                importanceColors?.border,
                'hover:brightness-125',
              ],
              // Selected styling
              isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105',
              // Has notes indicator
              annotation?.notes && 'after:absolute after:-top-0.5 after:-right-0.5 after:w-2 after:h-2 after:bg-white after:rounded-full',
              // Filter dim
              isFiltered && 'opacity-20 pointer-events-none',
              // Batch selected
              isBatchSelected && 'border-dashed border-[#00bcd4] border-2',
            )}
          >
            <span className="text-xs font-mono text-slate-300">
              MLP
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p className="font-semibold">Layer {layerIndex} • MLP</p>
            {annotation && (
              <>
                {annotation.tags.length > 0 && (
                  <p className="text-muted-foreground">
                    Tags: {annotation.tags.join(', ')}
                  </p>
                )}
                <p className="text-muted-foreground capitalize">
                  Importance: {annotation.importance}
                </p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
