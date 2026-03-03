'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTransformerStore } from '@/lib/store';
import { useProjects } from '@/hooks/useProjects';
import { PREDEFINED_TAGS, ImportanceLevel, Annotation } from '@/types/transformer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Trash2, Download, Upload, Database, CloudOff } from 'lucide-react';

// Internal form component that manages its own state
// Key prop from parent causes remount when selection changes, resetting state
function AnnotationForm({ 
  componentKey,
  selectedComponent,
  existingAnnotation
}: { 
  componentKey: string;
  selectedComponent: NonNullable<ReturnType<typeof useTransformerStore>['selectedComponent']>;
  existingAnnotation?: Annotation;
}) {
  const { addAnnotation, updateAnnotation, deleteAnnotation: localDeleteAnnotation } = useTransformerStore();
  const { currentProject, saveAnnotation, deleteAnnotation: dbDeleteAnnotation } = useProjects();

  // Initialize state from existing annotation (component remounts when key changes)
  const [notes, setNotes] = useState(existingAnnotation?.notes ?? '');
  const [tags, setTags] = useState<string[]>(existingAnnotation?.tags ?? []);
  const [importance, setImportance] = useState<ImportanceLevel>(existingAnnotation?.importance ?? 'unknown');
  const [customTag, setCustomTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Save annotation
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const annotationData: Annotation = {
      id: componentKey,
      componentType: selectedComponent.type,
      layerIndex: selectedComponent.layerIndex,
      headIndex: selectedComponent.headIndex,
      notes,
      tags,
      importance,
      createdAt: existingAnnotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (currentProject) {
      // Save to database
      await saveAnnotation({
        componentType: selectedComponent.type,
        layerIndex: selectedComponent.layerIndex,
        headIndex: selectedComponent.headIndex,
        notes,
        tags,
        importance,
      });
      // Also update local state
      if (existingAnnotation) {
        updateAnnotation(componentKey, annotationData);
      } else {
        addAnnotation(annotationData);
      }
    } else {
      // Save locally only
      if (existingAnnotation) {
        updateAnnotation(componentKey, annotationData);
      } else {
        addAnnotation(annotationData);
      }
    }
    setIsSaving(false);
  }, [componentKey, selectedComponent, notes, tags, importance, existingAnnotation, currentProject, saveAnnotation, addAnnotation, updateAnnotation]);

  // Delete annotation
  const handleDelete = useCallback(async () => {
    if (currentProject && existingAnnotation) {
      await dbDeleteAnnotation(existingAnnotation.id);
    }
    localDeleteAnnotation(componentKey);
    setNotes('');
    setTags([]);
    setImportance('unknown');
  }, [componentKey, currentProject, existingAnnotation, dbDeleteAnnotation, localDeleteAnnotation]);

  // Add tag
  const handleAddTag = useCallback((tag: string) => {
    setTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
  }, []);

  // Remove tag
  const handleRemoveTag = useCallback((tag: string) => {
    setTags(prev => prev.filter((t) => t !== tag));
  }, []);

  const handleAddCustomTag = useCallback(() => {
    if (customTag.trim()) {
      handleAddTag(customTag.trim());
      setCustomTag('');
    }
  }, [customTag, handleAddTag]);

  return (
    <>
      {/* Component Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-slate-300">
          Selected Component
        </h3>
        <div className="bg-slate-800 rounded-lg p-3 space-y-1">
          <p className="text-sm">
            <span className="text-slate-500">Type:</span>{' '}
            <span className="font-medium">
              {selectedComponent.type === 'attention_head' ? 'Attention Head' : 'MLP Block'}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500">Layer:</span>{' '}
            <span className="font-medium">{selectedComponent.layerIndex}</span>
          </p>
          {selectedComponent.headIndex !== undefined && (
            <p className="text-sm">
              <span className="text-slate-500">Head:</span>{' '}
              <span className="font-medium">{selectedComponent.headIndex}</span>
            </p>
          )}
        </div>
      </div>

      {/* Storage indicator */}
      {currentProject && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded p-2">
          <Database className="h-3 w-3" />
          Saving to: {currentProject.name}
        </div>
      )}

      {/* Importance Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Importance Level
        </label>
        <Select
          value={importance}
          onValueChange={(value) => setImportance(value as ImportanceLevel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                High
              </span>
            </SelectItem>
            <SelectItem value="medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Medium
              </span>
            </SelectItem>
            <SelectItem value="low">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Low
              </span>
            </SelectItem>
            <SelectItem value="unknown">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Unknown
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Tags
        </label>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-slate-700"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
        <Select onValueChange={handleAddTag}>
          <SelectTrigger>
            <SelectValue placeholder="Add predefined tag..." />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Custom tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomTag();
              }
            }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddCustomTag}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document your findings..."
          className="min-h-[120px] bg-slate-800 border-slate-700"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Annotation'}
        </Button>
        {existingAnnotation && (
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Timestamps */}
      {existingAnnotation && (
        <div className="text-xs text-slate-500 space-y-0.5 pt-2">
          <p>Created: {new Date(existingAnnotation.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(existingAnnotation.updatedAt).toLocaleString()}</p>
        </div>
      )}
    </>
  );
}

export function AnnotationPanel() {
  const {
    selectedComponent,
    annotations,
    getAnnotationKey,
    isPanelOpen,
    setPanelOpen,
    exportAnnotations,
    importAnnotations,
    currentProject,
  } = useTransformerStore();

  const [importError, setImportError] = useState('');

  // Get current annotation - memoized
  const key = useMemo(() => 
    selectedComponent ? getAnnotationKey(selectedComponent) : null,
    [selectedComponent, getAnnotationKey]
  );
  
  const currentAnnotation = useMemo(() => 
    key ? annotations[key] : undefined,
    [key, annotations]
  );

  // Export
  const handleExport = useCallback(() => {
    const data = exportAnnotations();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformer-annotations.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportAnnotations]);

  // Import
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importAnnotations(content);
      if (!success) {
        setImportError('Failed to parse JSON file');
      } else {
        setImportError('');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [importAnnotations]);

  if (!isPanelOpen) {
    return (
      <div className="fixed right-0 top-0 h-full w-12 flex items-center justify-center bg-slate-900 border-l border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPanelOpen(true)}
          className="rotate-90"
        >
          Annotations
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="font-semibold text-lg">Annotations</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {!currentProject && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded p-2">
              <CloudOff className="h-3 w-3" />
              No project loaded. Changes saved locally only.
            </div>
          )}
          
          {selectedComponent && key ? (
            <AnnotationForm 
              key={key} // Key causes remount when selection changes
              componentKey={key}
              selectedComponent={selectedComponent}
              existingAnnotation={currentAnnotation}
            />
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Click on a component to view or add annotations</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Export/Import Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {importError && (
          <p className="text-xs text-red-500">{importError}</p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Export Local
          </Button>
          <label className="flex-1">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <span>
                <Upload className="h-3 w-3 mr-1" />
                Import
              </span>
            </Button>
          </label>
        </div>
        <p className="text-xs text-slate-500 text-center">
          Use Projects for database sync
        </p>
      </div>
    </div>
  );
}
