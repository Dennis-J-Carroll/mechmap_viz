'use client';

import { X } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PREDEFINED_TAGS } from '@/types/transformer';

export function BatchToolbar() {
  const { batchSelected, applyBatchAnnotation, clearBatch, pushSnapshot, deleteAnnotation } = useTransformerStore();

  if (batchSelected.size < 2) return null;

  const handleSetImportance = async (importance: string) => {
    await applyBatchAnnotation({ importance });
  };

  const handleAddTag = async (tag: string) => {
    await applyBatchAnnotation({ tag });
  };

  const handleDeleteAll = () => {
    pushSnapshot();
    batchSelected.forEach((key) => deleteAnnotation(key));
    clearBatch();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-slate-900/95 border-b border-[rgba(0,188,212,0.3)] backdrop-blur-sm">
      <span className="text-xs text-[#00bcd4] font-medium">{batchSelected.size} selected</span>
      <span className="text-slate-700">|</span>

      <Select onValueChange={handleSetImportance}>
        <SelectTrigger className="h-7 w-32 text-xs">
          <SelectValue placeholder="Set importance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="unknown">Unknown</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleAddTag}>
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="Add tag" />
        </SelectTrigger>
        <SelectContent>
          {PREDEFINED_TAGS.map((tag) => (
            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="h-7 text-xs">
            Delete all
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {batchSelected.size} annotations?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected annotations will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearBatch}>
        <X className="h-3 w-3 mr-1" /> Clear
      </Button>
    </div>
  );
}
