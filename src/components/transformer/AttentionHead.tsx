'use client';

import { cn } from '@/lib/utils';
import { useTransformerStore } from '@/lib/store';
import { IMPORTANCE_COLORS, SelectedComponent } from '@/types/transformer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AttentionHeadProps {
  layerIndex: number;
  headIndex: number;
}

export function AttentionHead({ layerIndex, headIndex }: AttentionHeadProps) {
  const { selectedComponent, setSelectedComponent, annotations, getAnnotationKey, matchingKeys, filterQuery, filterImportance, filterTags, config, batchMode, batchSelected, toggleBatchComponent, selectBatchRange, lastBatchClicked, circuitBuildMode, activeCircuitId, circuits, addNodeToCircuit } = useTransformerStore();
  
  const componentId: SelectedComponent = {
    type: 'attention_head',
    layerIndex,
    headIndex,
  };
  
  const key = getAnnotationKey(componentId);
  const annotation = annotations[key];
  const isSelected = selectedComponent?.type === 'attention_head' &&
    selectedComponent.layerIndex === layerIndex &&
    selectedComponent.headIndex === headIndex;

  const hasActiveFilters = !!(filterQuery || filterImportance.length > 0 || filterTags.length > 0);
  const isFiltered = hasActiveFilters && !!annotation && !matchingKeys.has(key);

  const importanceColors = annotation ? IMPORTANCE_COLORS[annotation.importance] : null;

  const isBatchSelected = batchSelected.has(key);

  const activeCircuit = circuits.find((c) => c.id === activeCircuitId);
  const isInActiveCircuit = activeCircuit?.nodes.some(
    (n) =>
      n.componentType === 'attention_head' &&
      n.layerIndex === layerIndex &&
      n.headIndex === headIndex
  ) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    // Circuit build mode takes highest priority
    if (circuitBuildMode && activeCircuitId) {
      addNodeToCircuit(key);
      return;
    }
    // Batch mode
    if (batchMode) {
      if (e.shiftKey && lastBatchClicked) {
        selectBatchRange(lastBatchClicked, key, layerIndex, config.numHeadsPerLayer);
      } else {
        toggleBatchComponent(key);
      }
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
            aria-label={`Layer ${layerIndex}, Head ${headIndex}${
              annotation
                ? ` — ${annotation.importance}${annotation.tags.length > 0 ? ` — ${annotation.tags.join(', ')}` : ''}`
                : ' — unannotated'
            }`}
            aria-pressed={isSelected}
            style={
              isInActiveCircuit && activeCircuit
                ? { boxShadow: `0 0 0 2px ${activeCircuit.color}` }
                : undefined
            }
            className={cn(
              'relative w-7 h-7 rounded-full transition-all duration-200',
              'border-2 flex items-center justify-center',
              'hover:scale-110 hover:shadow-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
              // Default styling
              !annotation && 'bg-slate-700 border-slate-600 hover:border-slate-400',
              // Has annotation styling
              annotation && [
                importanceColors?.bg,
                importanceColors?.border,
                'hover:brightness-125',
              ],
              // Selected styling
              isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110',
              // Has notes indicator
              annotation?.notes && 'after:absolute after:-top-0.5 after:-right-0.5 after:w-2 after:h-2 after:bg-white after:rounded-full',
              // Filter dim
              isFiltered && 'opacity-20 pointer-events-none',
              // Batch selected
              isBatchSelected && 'border-dashed border-[#00bcd4] border-2',
            )}
          >
            <span className="text-[8px] font-mono text-slate-300">
              {headIndex}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p className="font-semibold">Layer {layerIndex} • Head {headIndex}</p>
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
