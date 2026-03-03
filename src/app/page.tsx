'use client';

import { useEffect } from 'react';
import { TransformerVisualization, AnnotationPanel, ConfigPanel, Legend, Stats, ProjectSelector } from '@/components/transformer';
import { Button } from '@/components/ui/button';
import { useTransformerStore } from '@/lib/store';
import { useProjects } from '@/hooks/useProjects';
import { Brain, Github, HelpCircle } from 'lucide-react';
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
  const { isPanelOpen, syncFromProject } = useTransformerStore();
  const { currentProject } = useProjects();

  // Sync store when project changes
  useEffect(() => {
    syncFromProject(currentProject);
  }, [currentProject, syncFromProject]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold">Mech Interp Viz</h1>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Mechanistic Interpretability Visualization
            </span>
          </div>
          
          <div className="flex items-center gap-2">
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
        {/* Left Sidebar - Legend & Stats */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 hidden lg:block overflow-y-auto">
          <div className="p-4 space-y-4">
            <Legend />
            <Stats />
          </div>
        </aside>

        {/* Center - Visualization */}
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${isPanelOpen ? 'mr-0' : ''}`}>
          <TransformerVisualization />
        </div>

        {/* Right Sidebar - Annotation Panel */}
        <div className={`${isPanelOpen ? 'block' : 'hidden'}`}>
          <AnnotationPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/30 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-slate-500">
          <span>Mech Interp Viz - Tool for Mechanistic Interpretability Research</span>
          <span>
            {currentProject 
              ? `Project: ${currentProject.name}` 
              : 'Local mode - Create a project to save to database'}
          </span>
        </div>
      </footer>
    </div>
  );
}
