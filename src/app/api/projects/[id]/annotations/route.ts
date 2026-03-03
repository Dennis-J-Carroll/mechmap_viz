import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/projects/[id]/annotations - List all annotations for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const annotations = await db.annotation.findMany({
      where: { projectId: id },
      orderBy: { updatedAt: 'desc' },
    });

    // Parse tags from JSON string
    const parsedAnnotations = annotations.map((a) => ({
      ...a,
      tags: JSON.parse(a.tags),
    }));

    return NextResponse.json(parsedAnnotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/annotations - Create a new annotation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { componentType, layerIndex, headIndex, notes, tags, importance } = body;

    // Check if annotation already exists for this component
    const existing = await db.annotation.findFirst({
      where: {
        projectId: id,
        componentType,
        layerIndex,
        headIndex: headIndex ?? null,
      },
    });

    if (existing) {
      // Update existing annotation
      const updated = await db.annotation.update({
        where: { id: existing.id },
        data: {
          notes,
          tags: JSON.stringify(tags),
          importance,
        },
      });
      return NextResponse.json({ ...updated, tags });
    }

    // Create new annotation
    const annotation = await db.annotation.create({
      data: {
        projectId: id,
        componentType,
        layerIndex,
        headIndex,
        notes,
        tags: JSON.stringify(tags),
        importance,
      },
    });

    return NextResponse.json({ ...annotation, tags }, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
