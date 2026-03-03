'use client';

import { useState, useEffect, useCallback } from 'react';
import { DbProject, DbAnnotation, ProjectWithAnnotations } from '@/types/api';

interface UseProjectsReturn {
  projects: DbProject[];
  currentProject: ProjectWithAnnotations | null;
  isLoading: boolean;
  error: string | null;
  
  // Project operations
  loadProjects: () => Promise<void>;
  createProject: (data: {
    name: string;
    description?: string;
    modelName?: string;
    numLayers?: number;
    numHeads?: number;
  }) => Promise<DbProject | null>;
  loadProject: (id: string) => Promise<void>;
  updateProject: (id: string, data: Partial<DbProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: ProjectWithAnnotations | null) => void;
  
  // Annotation operations
  saveAnnotation: (annotation: {
    componentType: string;
    layerIndex: number;
    headIndex?: number;
    notes: string;
    tags: string[];
    importance: string;
  }) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  
  // Export
  exportProject: (format: 'json' | 'markdown') => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectWithAnnotations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all projects
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback(async (data: {
    name: string;
    description?: string;
    modelName?: string;
    numLayers?: number;
    numHeads?: number;
  }): Promise<DbProject | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create project');
      const project = await response.json();
      setProjects((prev) => [project, ...prev]);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a specific project with annotations
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to load project');
      const data = await response.json();
      setCurrentProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id: string, data: Partial<DbProject>) => {
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update project');
      const updated = await response.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      if (currentProject?.id === id) {
        setCurrentProject({ ...currentProject, ...updated });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [currentProject]);

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [currentProject]);

  // Save annotation
  const saveAnnotation = useCallback(async (annotation: {
    componentType: string;
    layerIndex: number;
    headIndex?: number;
    notes: string;
    tags: string[];
    importance: string;
  }) => {
    if (!currentProject) return;
    setError(null);
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      });
      if (!response.ok) throw new Error('Failed to save annotation');
      const saved = await response.json();
      
      // Update current project state
      setCurrentProject((prev) => {
        if (!prev) return null;
        const existingIndex = prev.annotations.findIndex(
          (a) =>
            a.componentType === annotation.componentType &&
            a.layerIndex === annotation.layerIndex &&
            a.headIndex === (annotation.headIndex ?? null)
        );
        if (existingIndex >= 0) {
          const updated = [...prev.annotations];
          updated[existingIndex] = saved;
          return { ...prev, annotations: updated };
        }
        return { ...prev, annotations: [...prev.annotations, saved] };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [currentProject]);

  // Delete annotation
  const deleteAnnotation = useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/annotations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete annotation');
      setCurrentProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          annotations: prev.annotations.filter((a) => a.id !== id),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Export project
  const exportProject = useCallback(async (format: 'json' | 'markdown') => {
    if (!currentProject) return;
    try {
      const response = await fetch(
        `/api/export?projectId=${currentProject.id}&format=${format}`
      );
      if (!response.ok) throw new Error('Failed to export');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name}-export.${format === 'markdown' ? 'md' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [currentProject]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    saveAnnotation,
    deleteAnnotation,
    exportProject,
  };
}
