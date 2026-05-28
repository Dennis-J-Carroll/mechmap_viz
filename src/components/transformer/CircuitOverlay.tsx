'use client';

import { useTransformerStore } from '@/lib/store';
import type { HeatmapLayout } from './HeatmapView';
import type { CircuitPath, PathNodeData } from '@/types/transformer';

interface CircuitOverlayProps {
  layout: HeatmapLayout | null;
  width: number;
  height: number;
}

function cellCenter(layer: number, col: number, layout: HeatmapLayout) {
  return {
    x: layout.offsetX + col * layout.cellSize + layout.cellSize / 2,
    y: layout.offsetY + layer * layout.cellSize + layout.cellSize / 2,
  };
}

function nodeCol(node: PathNodeData, numHeadsPerLayer: number): number {
  if (node.componentType === 'mlp') return numHeadsPerLayer;
  return node.headIndex ?? 0;
}

function cubicBezier(sx: number, sy: number, tx: number, ty: number): string {
  const mx = (sx + tx) / 2 + 20;
  return `M${sx.toFixed(1)},${sy.toFixed(1)} C${mx.toFixed(1)},${sy.toFixed(1)} ${mx.toFixed(1)},${ty.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`;
}

interface CircuitArrowsProps {
  circuit: CircuitPath;
  layout: HeatmapLayout;
  isActive: boolean;
}

function CircuitArrows({ circuit, layout, isActive }: CircuitArrowsProps) {
  const { numHeadsPerLayer } = layout;
  const markerId = `arrow-${circuit.id}`;
  const opacity = isActive ? 1 : 0.35;
  const strokeWidth = isActive ? 2 : 1;
  const ringSize = layout.cellSize * 0.55;

  return (
    <g opacity={opacity}>
      <defs>
        <marker
          id={markerId}
          markerWidth={6}
          markerHeight={4}
          refX={5}
          refY={2}
          orient="auto"
        >
          <polygon points="0 0, 6 2, 0 4" fill={circuit.color} />
        </marker>
      </defs>

      {circuit.nodes.map((node, i) => {
        const col = nodeCol(node, numHeadsPerLayer);
        // Only render nodes that are within grid bounds
        if (node.layerIndex >= layout.numLayers || col > numHeadsPerLayer) return null;
        const center = cellCenter(node.layerIndex, col, layout);

        return (
          <g key={node.id}>
            {/* Node highlight ring */}
            <circle
              cx={center.x}
              cy={center.y}
              r={ringSize}
              fill="none"
              stroke={circuit.color}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray={isActive ? '3,2' : '2,2'}
              style={
                isActive
                  ? { filter: `drop-shadow(0 0 2px ${circuit.color})` }
                  : undefined
              }
            />

            {/* Arrow to next node */}
            {i < circuit.nodes.length - 1 &&
              (() => {
                const next = circuit.nodes[i + 1];
                const nextCol = nodeCol(next, numHeadsPerLayer);
                if (next.layerIndex >= layout.numLayers || nextCol > numHeadsPerLayer) return null;
                const nextCenter = cellCenter(next.layerIndex, nextCol, layout);
                const d = cubicBezier(center.x, center.y, nextCenter.x, nextCenter.y);
                const midX = (center.x + nextCenter.x) / 2 + 10;
                const midY = (center.y + nextCenter.y) / 2;
                const connType = node.connectionType;

                return (
                  <g key={`arrow-${node.id}`}>
                    <path
                      d={d}
                      stroke={circuit.color}
                      strokeWidth={strokeWidth}
                      fill="none"
                      markerEnd={`url(#${markerId})`}
                    />
                    {connType && isActive && (
                      <g>
                        <rect
                          x={midX - 8}
                          y={midY - 5}
                          width={16}
                          height={10}
                          rx={2}
                          fill="#0a0e14"
                          stroke={circuit.color}
                          strokeOpacity={0.5}
                          strokeWidth={0.5}
                        />
                        <text
                          x={midX}
                          y={midY + 3.5}
                          fontSize={7}
                          fill={circuit.color}
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {connType.toUpperCase()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}
          </g>
        );
      })}
    </g>
  );
}

export function CircuitOverlay({ layout, width, height }: CircuitOverlayProps) {
  const { circuits, activeCircuitId } = useTransformerStore();

  if (!layout || circuits.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      width={width}
      height={height}
    >
      {/* Inactive circuits first (dimmed), active on top */}
      {circuits
        .filter((c) => c.id !== activeCircuitId)
        .map((circuit) => (
          <CircuitArrows
            key={circuit.id}
            circuit={circuit}
            layout={layout}
            isActive={false}
          />
        ))}
      {circuits
        .filter((c) => c.id === activeCircuitId)
        .map((circuit) => (
          <CircuitArrows
            key={circuit.id}
            circuit={circuit}
            layout={layout}
            isActive={true}
          />
        ))}
    </svg>
  );
}
