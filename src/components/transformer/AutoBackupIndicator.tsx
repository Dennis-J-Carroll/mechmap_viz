'use client';

import { useEffect, useState } from 'react';
import { useTransformerStore } from '@/lib/store';

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

export function AutoBackupIndicator() {
  const { currentProject, isDirty } = useTransformerStore();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [, forceUpdate] = useState(0);

  // Update the "X ago" text every 30s
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Track when isDirty goes false = just saved
  useEffect(() => {
    if (!isDirty && currentProject) {
      setSavedAt(new Date());
    }
  }, [isDirty, currentProject]);

  if (!currentProject) return null;

  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Unsaved changes
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Saved{savedAt ? ` · ${timeAgo(savedAt)}` : ''}
    </span>
  );
}
