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
    }),
    {
      name: 'transformer-viz-storage',
      partialize: (state) => ({
        config: state.config,
        // Only persist annotations if no project is loaded (for offline/local use)
        ...(state.currentProject ? {} : { annotations: state.annotations }),
      }),
    }
  )
);
