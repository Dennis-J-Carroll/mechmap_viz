import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/annotations/[id] - Get a specific annotation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const annotation = await db.annotation.findUnique({
      where: { id },
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...annotation,
      tags: JSON.parse(annotation.tags),
    });
  } catch (error) {
    console.error('Error fetching annotation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotation' },
      { status: 500 }
    );
  }
}

// PUT /api/annotations/[id] - Update an annotation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notes, tags, importance } = body;

    const annotation = await db.annotation.update({
      where: { id },
      data: {
        notes,
        tags: JSON.stringify(tags),
        importance,
      },
    });

    return NextResponse.json({ ...annotation, tags });
  } catch (error) {
    console.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}

// DELETE /api/annotations/[id] - Delete an annotation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.annotation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete annotation' },
      { status: 500 }
    );
  }
}
