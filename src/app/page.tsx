'use client';

import { useCallback, useEffect, useState } from 'react';
import { TransformerVisualization, AnnotationPanel, ConfigPanel, Legend, Stats, ProjectSelector, LayeredNetworkIcon, UndoRedo, SearchBar, AutoBackupIndicator, MobileAnnotationDrawer } from '@/components/transformer';
import { Button } from '@/components/ui/button';
import { useTransformerStore } from '@/lib/store';
import { useProjects } from '@/hooks/useProjects';
import { useIsMobile } from '@/hooks/use-mobile';
import { Github, HelpCircle, LayoutGrid, AlignJustify, Layers, PenLine, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Home() {
  const { isPanelOpen, setPanelOpen, syncFromProject, undo, redo, view, setView, batchMode, toggleBatchMode } = useTransformerStore();
  const { currentProject } = useProjects();
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'viz' | 'notes' | 'stats'>('viz');

  // Sync store when project changes
  useEffect(() => {
    syncFromProject(currentProject);
  }, [currentProject, syncFromProject]);

  // Announce helper for screen readers
  const announce = useCallback((msg: string) => {
    const el = document.getElementById('sr-live');
    if (el) {
      el.textContent = msg;
      setTimeout(() => { el.textContent = ''; }, 1000);
    }
  }, []);

  // Global Ctrl+Z / Ctrl+Shift+Z / Ctrl+S handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const inInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

      if (isCtrl && e.key === 'z' && !e.shiftKey && !inInput) {
        e.preventDefault();
        undo();
        announce('Undo');
      } else if (isCtrl && e.key === 'z' && e.shiftKey && !inInput) {
        e.preventDefault();
        redo();
        announce('Redo');
      } else if (isCtrl && e.key === 's' && !inInput) {
        e.preventDefault();
        const saveBtn = document.querySelector<HTMLButtonElement>('[data-save-annotation]');
        saveBtn?.click();
      } else if ((e.key === 'h' || e.key === 'H') && !inInput) {
        setView(view === 'flow' ? 'heatmap' : 'flow');
      } else if ((e.key === 'b' || e.key === 'B') && !inInput) {
        toggleBatchMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, announce, view, setView, toggleBatchMode]);

  return (
    <div className="min-h-screen bg-djc-navy text-slate-100 flex flex-col">
      {/* Header */}
      <header role="banner" className="border-b border-djc-border bg-djc-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayeredNetworkIcon className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold">Mech Interp Viz</h1>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Mechanistic Interpretability Visualization
            </span>
            <SearchBar />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 border border-[rgba(0,188,212,0.2)] rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('flow')}
                className={cn('h-8 w-8 rounded-r-none', view === 'flow' && 'bg-[rgba(0,188,212,0.15)] text-[#00bcd4]')}
                aria-label="Flow view"
                aria-pressed={view === 'flow'}
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('heatmap')}
                className={cn('h-8 w-8 rounded-l-none', view === 'heatmap' && 'bg-[rgba(0,188,212,0.15)] text-[#00bcd4]')}
                aria-label="Heatmap view"
                aria-pressed={view === 'heatmap'}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBatchMode}
              className={cn('h-8 w-8', batchMode && 'bg-[rgba(0,188,212,0.15)] text-[#00bcd4]')}
              aria-label="Toggle batch annotation mode"
              aria-pressed={batchMode}
              title="Batch mode (B)"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <UndoRedo />
            {/* Project Selector */}
            <ProjectSelector />
            
            {/* Help Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>How to Use</DialogTitle>
                  <DialogDescription>
                    A guide to using the Mechanistic Interpretability Visualization Tool
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-slate-300">
                  <div>
                    <h4 className="font-medium mb-1">📁 Projects & Database</h4>
                    <p className="text-slate-400">
                      Create a project to save annotations to the database. Projects store your model configuration and all findings. Multiple researchers can share the same database.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">🔍 Exploring the Architecture</h4>
                    <p className="text-slate-400">
                      The visualization shows transformer layers stacked vertically. Each layer contains attention heads (circles) and an MLP block. Click any component to select it.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">📝 Adding Annotations</h4>
                    <p className="text-slate-400">
                      Select a component and use the right panel to add notes, tags, and importance ratings. When a project is loaded, annotations sync to the database automatically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">🎨 Color Coding</h4>
                    <p className="text-slate-400">
                      Red = High importance, Amber = Medium, Green = Low, Gray = Unknown. Components with notes show a white dot indicator.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">📤 Export Options</h4>
                    <p className="text-slate-400">
                      Export projects as JSON (for backup/sharing) or Markdown (for documentation). Local annotations can also be exported/imported via the panel.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Config Panel */}
            <ConfigPanel />
            
            {/* GitHub Link */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View on GitHub</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — hidden on mobile and tablet */}
        <aside
          role="complementary"
          aria-label="Legend and statistics"
          className="w-64 border-r border-[rgba(0,188,212,0.1)] bg-[#0f1419]/30 hidden lg:block overflow-y-auto"
        >
          <div className="p-4 space-y-4">
            <Legend />
            <Stats />
          </div>
        </aside>

        {/* Center — Visualization (hidden on mobile when on stats tab) */}
        <div
          role="main"
          aria-label="Transformer architecture visualization"
          className={cn(
            'flex-1 overflow-hidden transition-all duration-300',
            isMobile && mobileTab === 'stats' ? 'hidden' : ''
          )}
        >
          <TransformerVisualization />
        </div>

        {/* Right panel — hidden on mobile (use drawer instead) */}
        {!isMobile && isPanelOpen && (
          <div role="complementary" aria-label="Annotation panel">
            <AnnotationPanel />
          </div>
        )}

        {/* Mobile: Stats tab content */}
        {isMobile && mobileTab === 'stats' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Legend />
            <Stats />
          </div>
        )}
      </main>

      {/* Mobile: Vaul annotation drawer */}
      {isMobile && <MobileAnnotationDrawer />}

      {/* Mobile tab bar */}
      {isMobile && (
        <nav
          className="border-t border-[rgba(0,188,212,0.15)] bg-[#0f1419] flex items-center justify-around py-2"
          aria-label="Mobile navigation"
        >
          {[
            { id: 'viz' as const, icon: <LayoutGrid className="h-5 w-5" />, label: 'Viz' },
            { id: 'notes' as const, icon: <PenLine className="h-5 w-5" />, label: 'Notes' },
            { id: 'stats' as const, icon: <BarChart3 className="h-5 w-5" />, label: 'Stats' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setMobileTab(id);
                if (id === 'notes') setPanelOpen(true);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors',
                mobileTab === id ? 'text-[#00bcd4]' : 'text-slate-500 hover:text-slate-300'
              )}
              aria-current={mobileTab === id ? 'page' : undefined}
            >
              {icon}
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t border-[rgba(0,188,212,0.1)] bg-[#0f1419]/30 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-slate-500">
          <span>Mech Interp Viz — Mechanistic Interpretability Research</span>
          <AutoBackupIndicator />
        </div>
      </footer>

      {/* ARIA live region for screen reader announcements */}
      <div
        id="sr-live"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}
