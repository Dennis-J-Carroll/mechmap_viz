'use client';

import { useTransformerStore } from '@/lib/store';
import { useMemo } from 'react';

export function Stats() {
  const { annotations, config } = useTransformerStore();

  const stats = useMemo(() => {
    const annotationList = Object.values(annotations);
    const totalComponents = config.numLayers * (config.numHeadsPerLayer + 1);
    
    const annotatedHeads = annotationList.filter(a => a.componentType === 'attention_head').length;
    const annotatedMLPs = annotationList.filter(a => a.componentType === 'mlp').length;
    const totalHeads = config.numLayers * config.numHeadsPerLayer;
    
    const importanceCounts = {
      high: annotationList.filter(a => a.importance === 'high').length,
      medium: annotationList.filter(a => a.importance === 'medium').length,
      low: annotationList.filter(a => a.importance === 'low').length,
      unknown: annotationList.filter(a => a.importance === 'unknown').length,
    };

    const allTags = annotationList.flatMap(a => a.tags);
    const tagCounts: Record<string, number> = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalComponents,
      totalAnnotated: annotationList.length,
      annotatedHeads,
      annotatedMLPs,
      totalHeads,
      totalMLPs: config.numLayers,
      coverage: ((annotationList.length / totalComponents) * 100).toFixed(1),
      importanceCounts,
      topTags,
    };
  }, [annotations, config]);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
      <h3 className="font-medium text-sm text-slate-300">Statistics</h3>
      
      {/* Coverage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Coverage</span>
          <span className="font-mono">{stats.coverage}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${stats.coverage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {stats.totalAnnotated} of {stats.totalComponents} components annotated
        </p>
      </div>

      {/* Component Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-700/50 rounded p-2">
          <p className="text-slate-500 text-xs">Heads</p>
          <p className="font-mono">{stats.annotatedHeads}/{stats.totalHeads}</p>
        </div>
        <div className="bg-slate-700/50 rounded p-2">
          <p className="text-slate-500 text-xs">MLPs</p>
          <p className="font-mono">{stats.annotatedMLPs}/{stats.totalMLPs}</p>
        </div>
      </div>

      {/* Importance Distribution */}
      <div className="space-y-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Importance</p>
        <div className="grid grid-cols-4 gap-1 text-center text-xs">
          <div className="bg-red-900/30 rounded p-1.5">
            <p className="font-mono">{stats.importanceCounts.high}</p>
            <p className="text-slate-500">High</p>
          </div>
          <div className="bg-amber-900/30 rounded p-1.5">
            <p className="font-mono">{stats.importanceCounts.medium}</p>
            <p className="text-slate-500">Med</p>
          </div>
          <div className="bg-green-900/30 rounded p-1.5">
            <p className="font-mono">{stats.importanceCounts.low}</p>
            <p className="text-slate-500">Low</p>
          </div>
          <div className="bg-slate-700/50 rounded p-1.5">
            <p className="font-mono">{stats.importanceCounts.unknown}</p>
            <p className="text-slate-500">Unk</p>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      {stats.topTags.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Top Tags</p>
          <div className="space-y-1">
            {stats.topTags.map(([tag, count]) => (
              <div key={tag} className="flex justify-between text-sm">
                <span className="text-slate-400 truncate">{tag}</span>
                <span className="font-mono text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
