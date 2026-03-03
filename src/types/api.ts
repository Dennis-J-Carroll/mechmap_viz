// API-related types for database sync

export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  modelName: string;
  numLayers: number;
  numHeads: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    annotations: number;
  };
}

export interface DbAnnotation {
  id: string;
  projectId: string;
  componentType: string;
  layerIndex: number;
  headIndex: number | null;
  notes: string;
  tags: string[];
  importance: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithAnnotations extends DbProject {
  annotations: DbAnnotation[];
}

export interface ExportData {
  project: {
    id: string;
    name: string;
    description: string | null;
    modelName: string;
    numLayers: number;
    numHeads: number;
    createdAt: string;
    updatedAt: string;
  };
  annotations: DbAnnotation[];
  exportedAt: string;
}
