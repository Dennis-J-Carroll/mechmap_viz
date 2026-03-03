'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/hooks/useProjects';
import { FolderOpen, Plus, ChevronDown, Trash2, Download, FileJson, FileText, Database, CloudOff } from 'lucide-react';

const MODEL_PRESETS = [
  { name: 'GPT-2 Small', layers: 12, heads: 12 },
  { name: 'GPT-2 Medium', layers: 24, heads: 16 },
  { name: 'GPT-2 Large', layers: 36, heads: 20 },
  { name: 'GPT-2 XL', layers: 48, heads: 25 },
  { name: 'GPT-3 (175B)', layers: 96, heads: 96 },
  { name: 'Custom', layers: 12, heads: 12 },
];

export function ProjectSelector() {
  const {
    projects,
    currentProject,
    isLoading,
    createProject,
    loadProject,
    deleteProject,
    exportProject,
  } = useProjects();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    modelName: 'GPT-2 Small',
    numLayers: 12,
    numHeads: 12,
  });

  const handlePresetChange = useCallback((presetName: string) => {
    const preset = MODEL_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setNewProject((prev) => ({
        ...prev,
        modelName: preset.name,
        numLayers: preset.layers,
        numHeads: preset.heads,
      }));
    }
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newProject.name.trim()) return;
    const project = await createProject(newProject);
    if (project) {
      setIsCreateOpen(false);
      setNewProject({
        name: '',
        description: '',
        modelName: 'GPT-2 Small',
        numLayers: 12,
        numHeads: 12,
      });
      // Auto-load the new project
      loadProject(project.id);
    }
  }, [newProject, createProject, loadProject]);

  const handleDelete = useCallback(async () => {
    if (deleteProjectId) {
      await deleteProject(deleteProjectId);
      setDeleteProjectId(null);
    }
  }, [deleteProjectId, deleteProject]);

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <Database className="h-3 w-3" />
        <span className="hidden sm:inline">
          {currentProject ? currentProject.name : 'No project'}
        </span>
        {currentProject && (
          <Badge variant="outline" className="ml-1 text-xs">
            {currentProject.annotations?.length || 0} annotations
          </Badge>
        )}
      </div>

      {/* Project Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <FolderOpen className="h-4 w-4 mr-1" />
            Projects
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {projects.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-slate-500">
              <CloudOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <p className="text-xs">Create one to get started</p>
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => loadProject(project.id)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{project.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {project._count?.annotations || 0}
                    </Badge>
                    {currentProject?.id === project.id && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400"
                onClick={() => currentProject && setDeleteProjectId(currentProject.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Current Project
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to store your annotations in the database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., GPT-2 Induction Heads Analysis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of your research..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Model Preset</Label>
              <Select
                value={newProject.modelName}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="layers">Layers</Label>
                <Input
                  id="layers"
                  type="number"
                  min={1}
                  max={128}
                  value={newProject.numLayers}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      numLayers: parseInt(e.target.value) || 12,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heads">Heads/Layer</Label>
                <Input
                  id="heads"
                  type="number"
                  min={1}
                  max={128}
                  value={newProject.numHeads}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      numHeads: parseInt(e.target.value) || 12,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newProject.name.trim() || isLoading}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dropdown */}
      {currentProject && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportProject('json')}>
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportProject('markdown')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={(open) => !open && setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all {currentProject?.annotations?.length || 0} annotations.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
