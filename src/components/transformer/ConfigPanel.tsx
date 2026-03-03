'use client';

import { useTransformerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Settings } from 'lucide-react';

const MODEL_PRESETS = [
  { name: 'GPT-2 Small', layers: 12, heads: 12 },
  { name: 'GPT-2 Medium', layers: 24, heads: 16 },
  { name: 'GPT-2 Large', layers: 36, heads: 20 },
  { name: 'GPT-2 XL', layers: 48, heads: 25 },
  { name: 'GPT-3 Small', layers: 12, heads: 12 },
  { name: 'GPT-3 Medium', layers: 24, heads: 16 },
  { name: 'Custom', layers: 12, heads: 12 },
];

export function ConfigPanel() {
  const { config, setConfig, isConfigPanelOpen, setConfigPanelOpen } = useTransformerStore();

  const handlePresetChange = (presetName: string) => {
    const preset = MODEL_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setConfig({
        modelName: preset.name,
        numLayers: preset.layers,
        numHeadsPerLayer: preset.heads,
      });
    }
  };

  return (
    <Sheet open={isConfigPanelOpen} onOpenChange={setConfigPanelOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Model Configuration</SheetTitle>
          <SheetDescription>
            Configure the transformer architecture parameters.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              value={config.modelName}
              onChange={(e) => setConfig({ modelName: e.target.value })}
              placeholder="Enter model name..."
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {MODEL_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={config.modelName === preset.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetChange(preset.name)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Number of Layers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="numLayers">Number of Layers</Label>
              <span className="text-sm font-mono bg-slate-800 px-2 py-0.5 rounded">
                {config.numLayers}
              </span>
            </div>
            <Slider
              id="numLayers"
              min={1}
              max={48}
              step={1}
              value={[config.numLayers]}
              onValueChange={([value]) => setConfig({ numLayers: value })}
            />
            <p className="text-xs text-muted-foreground">
              Standard models: GPT-2 Small (12), GPT-2 Medium (24), GPT-2 Large (36)
            </p>
          </div>

          {/* Number of Heads per Layer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="numHeads">Attention Heads per Layer</Label>
              <span className="text-sm font-mono bg-slate-800 px-2 py-0.5 rounded">
                {config.numHeadsPerLayer}
              </span>
            </div>
            <Slider
              id="numHeads"
              min={1}
              max={32}
              step={1}
              value={[config.numHeadsPerLayer]}
              onValueChange={([value]) => setConfig({ numHeadsPerLayer: value })}
            />
            <p className="text-xs text-muted-foreground">
              Standard models typically use 12-20 heads per layer
            </p>
          </div>

          {/* Model Info */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Model Summary</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>
                <span className="text-slate-400">Total Attention Heads:</span>{' '}
                {config.numLayers * config.numHeadsPerLayer}
              </p>
              <p>
                <span className="text-slate-400">Total MLP Blocks:</span>{' '}
                {config.numLayers}
              </p>
              <p>
                <span className="text-slate-400">Total Components:</span>{' '}
                {config.numLayers * (config.numHeadsPerLayer + 1)}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
