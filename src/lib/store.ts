import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Annotation,
  TransformerConfig,
  SelectedComponent,
} from '@/types/transformer';
import { DbAnnotation, ProjectWithAnnotations } from '@/types/api';

interface TransformerStore {
  // Configuration (local, for UI purposes)
  config: TransformerConfig;
  setConfig: (config: Partial<TransformerConfig>) => void;

  // Selection
  selectedComponent: SelectedComponent | null;
  setSelectedComponent: (component: SelectedComponent | null) => void;

  // Annotations (local cache, synced from DB)
  annotations: Record<string, Annotation>;
  setAnnotations: (annotations: Record<string, Annotation>) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  getAnnotationKey: (component: SelectedComponent) => string;

  // Project sync
  currentProject: ProjectWithAnnotations | null;
  setCurrentProject: (project: ProjectWithAnnotations | null) => void;
  syncFromProject: (project: ProjectWithAnnotations | null) => void;

  // Export/Import (local backup)
  exportAnnotations: () => string;
  importAnnotations: (json: string) => boolean;

  // Panel state
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;

  // Config panel state
  isConfigPanelOpen: boolean;
  setConfigPanelOpen: (open: boolean) => void;

  // History slice — undo/redo
  history: Record<string, Annotation>[];
  historyPointer: number;
  isDirty: boolean;
  isRestoring: boolean;
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Filter slice
  filterQuery: string;
  filterImportance: string[];
  filterTags: string[];
  matchingKeys: Set<string>;
  setFilterQuery: (q: string) => void;
  toggleFilterImportance: (level: string) => void;
  toggleFilterTag: (tag: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;

  // View slice
  view: 'flow' | 'heatmap';
  setView: (v: 'flow' | 'heatmap') => void;

  // Batch slice
  batchMode: boolean;
  batchSelected: Set<string>;
  lastBatchClicked: string | null;
  toggleBatchMode: () => void;
  toggleBatchComponent: (key: string) => void;
  selectBatchRange: (fromKey: string, toKey: string, layerIndex: number, numHeads: number) => void;
  applyBatchAnnotation: (data: { importance?: string; tag?: string }) => Promise<void>;
  clearBatch: () => void;
}

// Helper to generate unique key for a component
const getComponentKey = (component: SelectedComponent): string => {
  if (component.type === 'mlp') {
    return `mlp-layer-${component.layerIndex}`;
  }
  return `head-layer-${component.layerIndex}-head-${component.headIndex}`;
};

// Convert DB annotation to local annotation format
const dbToLocalAnnotation = (db: DbAnnotation): Annotation => ({
  id: db.id,
  componentType: db.componentType as 'attention_head' | 'mlp',
  layerIndex: db.layerIndex,
  headIndex: db.headIndex ?? undefined,
  notes: db.notes,
  tags: db.tags,
  importance: db.importance as 'high' | 'medium' | 'low' | 'unknown',
  createdAt: db.createdAt,
  updatedAt: db.updatedAt,
});

// Generate component key from DB annotation
const getDbAnnotationKey = (db: DbAnnotation): string => {
  if (db.componentType === 'mlp') {
    return `mlp-layer-${db.layerIndex}`;
  }
  return `head-layer-${db.layerIndex}-head-${db.headIndex}`;
};

export const useTransformerStore = create<TransformerStore>()(
  persist(
    (set, get) => ({
      // Default configuration (GPT-2 like)
      config: {
        modelName: 'GPT-2 Small',
        numLayers: 12,
        numHeadsPerLayer: 12,
      },
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      // Selection
      selectedComponent: null,
      setSelectedComponent: (component) => {
        set({ selectedComponent: component });
        if (component) {
          set({ isPanelOpen: true });
        }
      },

      // Annotations
      annotations: {},
      setAnnotations: (annotations) => set({ annotations }),
      addAnnotation: (annotation) =>
        set((state) => ({
          annotations: { ...state.annotations, [annotation.id]: annotation },
        })),
      updateAnnotation: (id, updates) =>
        set((state) => {
          const existing = state.annotations[id];
          if (!existing) return state;
          return {
            annotations: {
              ...state.annotations,
              [id]: {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      deleteAnnotation: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.annotations;
          return { annotations: rest };
        }),
      getAnnotationKey: getComponentKey,

      // Project sync
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      syncFromProject: (project) => {
        if (!project) {
          set({ 
            currentProject: null, 
            annotations: {},
            config: {
              modelName: 'GPT-2 Small',
              numLayers: 12,
              numHeadsPerLayer: 12,
            }
          });
          return;
        }

        // Convert DB annotations to local format
        const localAnnotations: Record<string, Annotation> = {};
        for (const dbAnnotation of project.annotations) {
          const key = getDbAnnotationKey(dbAnnotation);
          localAnnotations[key] = dbToLocalAnnotation(dbAnnotation);
        }

        set({
          currentProject: project,
          annotations: localAnnotations,
          config: {
            modelName: project.modelName,
            numLayers: project.numLayers,
            numHeadsPerLayer: project.numHeads,
          },
        });
      },

      // Export/Import
      exportAnnotations: () => {
        const state = get();
        return JSON.stringify(
          {
            config: state.config,
            annotations: state.annotations,
          },
          null,
          2
        );
      },
      importAnnotations: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.annotations) {
            set({ annotations: data.annotations });
          }
          if (data.config) {
            set({ config: data.config });
          }
          return true;
        } catch {
          return false;
        }
      },

      // Panel state
      isPanelOpen: false,
      setPanelOpen: (open) => set({ isPanelOpen: open }),

      // Config panel state
      isConfigPanelOpen: false,
      setConfigPanelOpen: (open) => set({ isConfigPanelOpen: open }),

      // History slice
      history: [],
      historyPointer: -1,
      isDirty: false,
      isRestoring: false,

      pushSnapshot: () => {
        const state = get();
        if (state.isRestoring) return;
        const snapshot = structuredClone(state.annotations);
        const stack = state.history.slice(0, state.historyPointer + 1);
        stack.push(snapshot);
        const trimmed = stack.length > 20 ? stack.slice(stack.length - 20) : stack;
        set({ history: trimmed, historyPointer: trimmed.length - 1 });
      },

      undo: () => {
        const { history, historyPointer, currentProject } = get();
        if (historyPointer <= 0) return;
        const newPointer = historyPointer - 1;
        const snapshot = structuredClone(history[newPointer]);
        set({
          annotations: snapshot,
          historyPointer: newPointer,
          isRestoring: true,
          isDirty: currentProject !== null,
        });
        set({ isRestoring: false });
      },

      redo: () => {
        const { history, historyPointer, currentProject } = get();
        if (historyPointer >= history.length - 1) return;
        const newPointer = historyPointer + 1;
        const snapshot = structuredClone(history[newPointer]);
        set({
          annotations: snapshot,
          historyPointer: newPointer,
          isRestoring: true,
          isDirty: currentProject !== null,
        });
        set({ isRestoring: false });
      },

      // Filter slice
      filterQuery: '',
      filterImportance: [],
      filterTags: [],
      matchingKeys: new Set<string>(),

      setFilterQuery: (q) => {
        set({ filterQuery: q });
        get().applyFilters();
      },

      toggleFilterImportance: (level) => {
        const current = get().filterImportance;
        const next = current.includes(level)
          ? current.filter((l) => l !== level)
          : [...current, level];
        set({ filterImportance: next });
        get().applyFilters();
      },

      toggleFilterTag: (tag) => {
        const current = get().filterTags;
        const next = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag];
        set({ filterTags: next });
        get().applyFilters();
      },

      clearFilters: () => {
        set({ filterQuery: '', filterImportance: [], filterTags: [] });
        get().applyFilters();
      },

      applyFilters: () => {
        const { annotations, filterQuery, filterImportance, filterTags } = get();
        const hasQuery = filterQuery.trim().length > 0;
        const hasImportance = filterImportance.length > 0;
        const hasTag = filterTags.length > 0;

        if (!hasQuery && !hasImportance && !hasTag) {
          set({ matchingKeys: new Set(Object.keys(annotations)) });
          return;
        }

        const query = filterQuery.toLowerCase().trim();
        const matches = new Set<string>();

        for (const [key, ann] of Object.entries(annotations)) {
          let ok = true;
          if (hasQuery) {
            const searchable = [key, ...ann.tags, ann.notes].join(' ').toLowerCase();
            ok = ok && searchable.includes(query);
          }
          if (ok && hasImportance) {
            ok = filterImportance.includes(ann.importance);
          }
          if (ok && hasTag) {
            ok = ann.tags.some((t) => filterTags.includes(t));
          }
          if (ok) matches.add(key);
        }
        set({ matchingKeys: matches });
      },

      // View slice
      view: 'flow',
      setView: (v) => set({ view: v }),

      // Batch slice
      batchMode: false,
      batchSelected: new Set<string>(),
      lastBatchClicked: null,

      toggleBatchMode: () => set((s) => ({ batchMode: !s.batchMode, batchSelected: new Set(), lastBatchClicked: null })),

      toggleBatchComponent: (key) => {
        const current = get().batchSelected;
        const next = new Set(current);
        if (next.has(key)) { next.delete(key); } else { next.add(key); }
        set({ batchSelected: next, lastBatchClicked: key });
      },

      selectBatchRange: (fromKey, toKey, layerIndex, numHeads) => {
        const parseHead = (k: string) => {
          const m = k.match(/head-layer-\d+-head-(\d+)/);
          return m ? parseInt(m[1]) : null;
        };
        const fromHead = parseHead(fromKey);
        const toHead = parseHead(toKey);
        if (fromHead === null || toHead === null) {
          get().toggleBatchComponent(toKey);
          return;
        }
        const min = Math.min(fromHead, toHead);
        const max = Math.max(fromHead, toHead);
        const next = new Set(get().batchSelected);
        for (let h = min; h <= max; h++) {
          next.add(`head-layer-${layerIndex}-head-${h}`);
        }
        set({ batchSelected: next, lastBatchClicked: toKey });
      },

      applyBatchAnnotation: async ({ importance, tag }) => {
        const { batchSelected, annotations, pushSnapshot, addAnnotation, updateAnnotation, currentProject } = get();
        pushSnapshot();
        const now = new Date().toISOString();
        const results = await Promise.allSettled(
          Array.from(batchSelected).map(async (key) => {
            const existing = annotations[key];
            const mlpMatch = key.match(/^mlp-layer-(\d+)$/);
            const headMatch = key.match(/^head-layer-(\d+)-head-(\d+)$/);
            if (!mlpMatch && !headMatch) return;
            const parsed = mlpMatch
              ? { type: 'mlp' as const, layerIndex: parseInt(mlpMatch[1]) }
              : { type: 'attention_head' as const, layerIndex: parseInt(headMatch![1]), headIndex: parseInt(headMatch![2]) };

            const updatedTags = tag && existing?.tags
              ? existing.tags.includes(tag) ? existing.tags : [...existing.tags, tag]
              : tag ? [tag] : (existing?.tags ?? []);

            const updated = {
              id: key,
              componentType: parsed.type,
              layerIndex: parsed.layerIndex,
              headIndex: 'headIndex' in parsed ? parsed.headIndex : undefined,
              notes: existing?.notes ?? '',
              tags: updatedTags,
              importance: (importance as any) ?? existing?.importance ?? 'unknown',
              createdAt: existing?.createdAt ?? now,
              updatedAt: now,
            };
            if (existing) { updateAnnotation(key, updated); } else { addAnnotation(updated); }

            if (currentProject) {
              const res = await fetch(`/api/projects/${currentProject.id}/annotations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  componentType: updated.componentType,
                  layerIndex: updated.layerIndex,
                  headIndex: updated.headIndex,
                  notes: updated.notes,
                  tags: updated.tags,
                  importance: updated.importance,
                }),
              });
              if (!res.ok) throw new Error(`Failed for ${key}`);
            }
          })
        );
        const failed = results.filter((r) => r.status === 'rejected').length;
        if (failed > 0) {
          const { toast } = await import('sonner');
          toast.error(`${failed} component${failed > 1 ? 's' : ''} failed to save`);
        }
      },

      clearBatch: () => set({ batchSelected: new Set(), lastBatchClicked: null }),
    }),
    {
      name: 'transformer-viz-storage',
      partialize: (state) => ({
        config: state.config,
        view: state.view,
        // Only persist annotations if no project is loaded (for offline/local use)
        ...(state.currentProject ? {} : { annotations: state.annotations }),
      }),
    }
  )
);
