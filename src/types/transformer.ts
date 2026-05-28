// Types for Mechanistic Interpretability Visualization Tool

export type ComponentType = 'attention_head' | 'mlp';

export type ImportanceLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface Annotation {
  id: string;
  componentType: ComponentType;
  layerIndex: number;
  headIndex?: number; // Only for attention heads
  notes: string;
  tags: string[];
  importance: ImportanceLevel;
  createdAt: string;
  updatedAt: string;
}

export interface TransformerConfig {
  modelName: string;
  numLayers: number;
  numHeadsPerLayer: number;
}

export interface SelectedComponent {
  type: ComponentType;
  layerIndex: number;
  headIndex?: number;
}

// Predefined tags for mechanistic interpretability research
export const PREDEFINED_TAGS = [
  'Induction Head',
  'Copy Head',
  'Name Mover',
  'Backup Name Mover',
  'Negative Name Mover',
  'S2 Inhibition',
  'Duplicate Token',
  'Previous Token',
  'Positional',
  'Content-Aware',
  'Pattern Matcher',
  'Signal Boosting',
  'Output Suppression',
  'Factual Recall',
  'Context Mixing',
  'Special Character',
  'Math Operation',
  'Syntactic',
  'Semantic',
  'Unknown Function',
] as const;

export type PredefinedTag = typeof PREDEFINED_TAGS[number];

// ─── Circuit Discovery Types ───────────────────────────────────────────────

export interface PathNodeData {
  id: string;
  position: number;
  componentType: 'attention_head' | 'mlp';
  layerIndex: number;
  headIndex?: number;
  role?: string;       // 'source' | 'relay' | 'amplifier' | 'inhibitor' | 'sink'
  signalType?: string; // 'positional' | 'content' | 'name' | 'fact' | 'pattern'
  notes?: string;
  connectionType?: 'and' | 'or';
  denoisingScore?: number;
  noisingScore?: number;
  annotationId?: string;
}

export interface CircuitPath {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  circuitType: string; // 'induction' | 'factual_recall' | 'copy' | 'inhibition' | 'boosting' | 'custom'
  hypothesis?: string;
  evidence?: string;
  confidence: string;  // 'verified' | 'likely' | 'speculative'
  color: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: PathNodeData[];
}

export interface CreateCircuitInput {
  name: string;
  circuitType: string;
  color: string;
  templateNodes?: Omit<PathNodeData, 'id' | 'position'>[];
}

// Color schemes for importance levels
export const IMPORTANCE_COLORS: Record<ImportanceLevel, { bg: string; border: string; text: string }> = {
  high: {
    bg: 'bg-red-500/20',
    border: 'border-red-500',
    text: 'text-red-400',
  },
  medium: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500',
    text: 'text-amber-400',
  },
  low: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-400',
  },
  unknown: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500',
    text: 'text-slate-400',
  },
};
