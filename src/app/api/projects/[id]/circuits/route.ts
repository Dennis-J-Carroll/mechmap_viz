import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/projects/[id]/circuits - List all circuit paths for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const circuits = await db.circuitPath.findMany({
            where: { projectId: id },
            include: {
                nodes: {
                    orderBy: { position: 'asc' },
                },
                contributor: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(circuits);
    } catch (error) {
        console.error('Error fetching circuits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch circuits' },
            { status: 500 }
        );
    }
}

// POST /api/projects/[id]/circuits - Create a new circuit path
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name,
            description,
            circuitType,
            hypothesis,
            evidence,
            confidence,
            color,
            contributorId,
            nodes,
        } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Circuit name is required' },
                { status: 400 }
            );
        }

        const circuit = await db.circuitPath.create({
            data: {
                projectId: id,
                name,
                description,
                circuitType: circuitType || 'unknown',
                hypothesis,
                evidence,
                confidence: confidence || 'speculative',
                color: color || '#3b82f6',
                contributorId,
                nodes: nodes
                    ? {
                        create: nodes.map((node: {
                            position: number;
                            componentType: string;
                            layerIndex: number;
                            headIndex?: number;
                            role?: string;
                            signalType?: string;
                            notes?: string;
                        }) => ({
                            position: node.position,
                            componentType: node.componentType,
                            layerIndex: node.layerIndex,
                            headIndex: node.headIndex,
                            role: node.role,
                            signalType: node.signalType,
                            notes: node.notes,
                        })),
                    }
                    : undefined,
            },
            include: {
                nodes: {
                    orderBy: { position: 'asc' },
                },
            },
        });

        return NextResponse.json(circuit, { status: 201 });
    } catch (error) {
        console.error('Error creating circuit:', error);
        return NextResponse.json(
            { error: 'Failed to create circuit' },
            { status: 500 }
        );
    }
}
