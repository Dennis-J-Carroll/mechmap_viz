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
  const { selectedComponent, setSelectedComponent, annotations, getAnnotationKey } = useTransformerStore();
  
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

  const importanceColors = annotation ? IMPORTANCE_COLORS[annotation.importance] : null;

  const handleClick = () => {
    setSelectedComponent(componentId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
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
