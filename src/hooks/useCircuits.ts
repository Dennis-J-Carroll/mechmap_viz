// src/hooks/useCircuits.ts
'use client';

import { useCallback } from 'react';
import { useTransformerStore } from '@/lib/store';
import type { CircuitPath } from '@/types/transformer';

export function useCircuits() {
  const { setCircuits, circuits } = useTransformerStore();

  const loadCircuits = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/circuits`);
      if (!res.ok) return;
      const data: CircuitPath[] = await res.json();
      setCircuits(data);
    } catch { /* swallow */ }
  }, [setCircuits]);

  return { circuits, loadCircuits };
}
