import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/export?projectId=xxx - Export project with all annotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const format = searchParams.get('format') || 'json';

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        annotations: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse annotations
    const annotations = project.annotations.map((a) => ({
      id: a.id,
      componentType: a.componentType,
      layerIndex: a.layerIndex,
      headIndex: a.headIndex,
      notes: a.notes,
      tags: JSON.parse(a.tags),
      importance: a.importance,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    const exportData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        modelName: project.modelName,
        numLayers: project.numLayers,
        numHeads: project.numHeads,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      annotations,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'markdown') {
      const markdown = generateMarkdown(exportData);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${project.name}-export.md"`,
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    );
  }
}

function generateMarkdown(data: {
  project: {
    name: string;
    description: string | null;
    modelName: string;
    numLayers: number;
    numHeads: number;
  };
  annotations: Array<{
    componentType: string;
    layerIndex: number;
    headIndex: number | null;
    notes: string;
    tags: string[];
    importance: string;
  }>;
}): string {
  const { project, annotations } = data;

  let md = `# Mechanistic Interpretability Notes: ${project.name}\n\n`;
  md += `## Model Configuration\n`;
  md += `- **Model**: ${project.modelName}\n`;
  md += `- **Layers**: ${project.numLayers}\n`;
  md += `- **Heads per Layer**: ${project.numHeads}\n`;
  if (project.description) {
    md += `- **Description**: ${project.description}\n`;
  }
  md += `\n`;

  // Group annotations by layer
  const byLayer: Record<number, typeof annotations> = {};
  for (const a of annotations) {
    if (!byLayer[a.layerIndex]) byLayer[a.layerIndex] = [];
    byLayer[a.layerIndex].push(a);
  }

  md += `## Annotated Components\n\n`;
  md += `Total annotations: ${annotations.length}\n\n`;

  for (let layer = 0; layer < project.numLayers; layer++) {
    const layerAnnotations = byLayer[layer] || [];
    if (layerAnnotations.length === 0) continue;

    md += `### Layer ${layer}\n\n`;

    // Attention heads
    const heads = layerAnnotations.filter((a) => a.componentType === 'attention_head');
    if (heads.length > 0) {
      md += `#### Attention Heads\n\n`;
      for (const h of heads.sort((a, b) => (a.headIndex ?? 0) - (b.headIndex ?? 0))) {
        md += `**Head ${h.headIndex}** [${h.importance.toUpperCase()}]\n`;
        if (h.tags.length > 0) {
          md += `Tags: ${h.tags.map((t) => `\`${t}\``).join(', ')}\n`;
        }
        if (h.notes) {
          md += `Notes: ${h.notes}\n`;
        }
        md += `\n`;
      }
    }

    // MLP
    const mlps = layerAnnotations.filter((a) => a.componentType === 'mlp');
    if (mlps.length > 0) {
      md += `#### MLP\n\n`;
      for (const m of mlps) {
        md += `[${m.importance.toUpperCase()}]\n`;
        if (m.tags.length > 0) {
          md += `Tags: ${m.tags.map((t) => `\`${t}\``).join(', ')}\n`;
        }
        if (m.notes) {
          md += `Notes: ${m.notes}\n`;
        }
        md += `\n`;
      }
    }
  }

  // Summary by tag
  const tagCounts: Record<string, number> = {};
  for (const a of annotations) {
    for (const tag of a.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  if (sortedTags.length > 0) {
    md += `## Tag Summary\n\n`;
    for (const [tag, count] of sortedTags) {
      md += `- ${tag}: ${count}\n`;
    }
  }

  return md;
}
