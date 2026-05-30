'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTransformerStore } from '@/lib/store';
import { CircuitOverlay } from './CircuitOverlay';

export interface HeatmapLayout {
  offsetX: number;
  offsetY: number;
  cellSize: number;
  numLayers: number;
  numHeadsPerLayer: number;
}

interface TooltipState {
  x: number;
  y: number;
  label: string;
  detail: string;
}

const HEATMAP_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  unknown: '#6b7280',
  unannotated: '#0a0e14',
};

interface HeatmapViewProps {
  layoutRef?: React.MutableRefObject<HeatmapLayout | null>;
}

export function HeatmapView({ layoutRef: externalLayoutRef }: HeatmapViewProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const internalLayoutRef = useRef<HeatmapLayout | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [cssDims, setCssDims] = useState({ w: 0, h: 0 });

  const { config, annotations, setSelectedComponent, setView } = useTransformerStore();
  const { numLayers, numHeadsPerLayer, modelName } = config;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    // Measure the canvas wrapper (already excludes the title via flex layout).
    const rect = wrap.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;
    if (cssW <= 0 || cssH <= 0) return;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const cols = numHeadsPerLayer + 1;
    const cellSize = Math.min((cssW - 48) / cols, (cssH - 32) / numLayers);
    const gridW = cellSize * cols;
    const gridH = cellSize * numLayers;
    const offsetX = (cssW - gridW) / 2;
    const offsetY = 24 + (cssH - 32 - gridH) / 2;

    const layout: HeatmapLayout = { offsetX, offsetY, cellSize, numLayers, numHeadsPerLayer };
    internalLayoutRef.current = layout;
    if (externalLayoutRef) externalLayoutRef.current = layout;

    // Draw cells
    for (let l = 0; l < numLayers; l++) {
      for (let c = 0; c < cols; c++) {
        const isMlp = c === numHeadsPerLayer;
        const key = isMlp ? `mlp-layer-${l}` : `head-layer-${l}-head-${c}`;
        const ann = annotations[key];
        const imp = ann?.importance ?? 'unannotated';
        const x = offsetX + c * cellSize;
        const y = offsetY + l * cellSize;
        const pad = 1;
        const r = isMlp ? 3 : 2;

        ctx.fillStyle = HEATMAP_COLORS[imp] ?? HEATMAP_COLORS.unannotated;
        ctx.beginPath();
        // Use roundRect if available, fallback to rect
        if ((ctx as any).roundRect) {
          (ctx as any).roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, r);
        } else {
          ctx.rect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
        }
        ctx.fill();

        // Notes dot
        if (ann?.notes) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + cellSize - pad - 3, y + pad + 3, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Row labels
    const fontSize = Math.max(8, Math.min(11, cellSize * 0.45));
    ctx.fillStyle = '#475569';
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'right';
    for (let l = 0; l < numLayers; l++) {
      ctx.fillText(`L${l}`, offsetX - 4, offsetY + l * cellSize + cellSize * 0.6);
    }

    // Column labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    for (let c = 0; c < cols; c++) {
      const label = c === numHeadsPerLayer ? 'MLP' : `H${c}`;
      ctx.fillText(label, offsetX + c * cellSize + cellSize / 2, offsetY - 6);
    }
  }, [config, annotations, numLayers, numHeadsPerLayer, externalLayoutRef]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setCssDims({ w: rect.width, h: rect.height });
      // Defer draw to next frame so we never write layout inside the
      // observer callback (avoids "ResizeObserver loop" warnings).
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => draw());
    });
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [draw]);

  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const layout = internalLayoutRef.current;
    const canvas = canvasRef.current;
    if (!layout || !canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor((mx - layout.offsetX) / layout.cellSize);
    const row = Math.floor((my - layout.offsetY) / layout.cellSize);
    if (row < 0 || row >= layout.numLayers || col < 0 || col >= layout.numHeadsPerLayer + 1) return null;
    const isMlp = col === layout.numHeadsPerLayer;
    return { row, col, isMlp, key: isMlp ? `mlp-layer-${row}` : `head-layer-${row}-head-${col}` };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (!cell) { setTooltip(null); return; }
    const ann = annotations[cell.key];
    const label = cell.isMlp ? `Layer ${cell.row} MLP` : `Layer ${cell.row}, Head ${cell.col}`;
    const detail = ann
      ? `${ann.importance}${ann.tags.length > 0 ? ` · ${ann.tags.length} tags` : ''}`
      : 'unannotated';
    setTooltip({ x: e.clientX, y: e.clientY, label, detail });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    setSelectedComponent(
      cell.isMlp
        ? { type: 'mlp', layerIndex: cell.row }
        : { type: 'attention_head', layerIndex: cell.row, headIndex: cell.col }
    );
    setView('flow');
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-center py-2 shrink-0">
        <h2 className="text-base font-bold text-slate-200">{modelName} — Heatmap</h2>
      </div>
      <div ref={canvasWrapRef} className="relative flex-1 min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          onClick={handleClick}
          className="absolute inset-0 cursor-pointer"
        />
        <CircuitOverlay
          layout={internalLayoutRef.current}
          width={cssDims.w}
          height={cssDims.h}
        />
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 shadow-lg space-y-0.5"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <p className="font-semibold">{tooltip.label}</p>
            <p className="text-slate-400">{tooltip.detail}</p>
          </div>
        )}
      </div>
    </div>
  );
}
