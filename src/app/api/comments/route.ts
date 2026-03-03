import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, contributorId, annotationId, circuitPathId, parentId } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            );
        }

        if (!annotationId && !circuitPathId) {
            return NextResponse.json(
                { error: 'Either annotationId or circuitPathId is required' },
                { status: 400 }
            );
        }

        const comment = await db.comment.create({
            data: {
                content,
                contributorId,
                annotationId,
                circuitPathId,
                parentId,
            },
            include: {
                contributor: {
                    select: { id: true, name: true },
                },
                replies: {
                    include: {
                        contributor: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

// DELETE /api/comments/[id] is handled by the [id] route below
