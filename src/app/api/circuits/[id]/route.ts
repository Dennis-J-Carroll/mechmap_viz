import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/circuits/[id] - Get a specific circuit path with nodes
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const circuit = await db.circuitPath.findUnique({
            where: { id },
            include: {
                nodes: {
                    orderBy: { position: 'asc' },
                    include: {
                        annotation: true,
                    },
                },
                contributor: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                comments: {
                    include: {
                        contributor: {
                            select: { id: true, name: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!circuit) {
            return NextResponse.json({ error: 'Circuit not found' }, { status: 404 });
        }

        return NextResponse.json(circuit);
    } catch (error) {
        console.error('Error fetching circuit:', error);
        return NextResponse.json(
            { error: 'Failed to fetch circuit' },
            { status: 500 }
        );
    }
}

// PUT /api/circuits/[id] - Update a circuit path
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, circuitType, hypothesis, evidence, confidence, color, nodes } = body;

        // Update the circuit
        const circuit = await db.circuitPath.update({
            where: { id },
            data: {
                name,
                description,
                circuitType,
                hypothesis,
                evidence,
                confidence,
                color,
            },
        });

        // If nodes are provided, replace them
        if (nodes) {
            await db.pathNode.deleteMany({ where: { circuitPathId: id } });
            await db.pathNode.createMany({
                data: nodes.map((node: {
                    position: number;
                    componentType: string;
                    layerIndex: number;
                    headIndex?: number;
                    role?: string;
                    signalType?: string;
                    notes?: string;
                }) => ({
                    circuitPathId: id,
                    position: node.position,
                    componentType: node.componentType,
                    layerIndex: node.layerIndex,
                    headIndex: node.headIndex,
                    role: node.role,
                    signalType: node.signalType,
                    notes: node.notes,
                })),
            });
        }

        // Return updated circuit with nodes
        const updated = await db.circuitPath.findUnique({
            where: { id },
            include: {
                nodes: { orderBy: { position: 'asc' } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating circuit:', error);
        return NextResponse.json(
            { error: 'Failed to update circuit' },
            { status: 500 }
        );
    }
}

// DELETE /api/circuits/[id] - Delete a circuit path
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.circuitPath.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting circuit:', error);
        return NextResponse.json(
            { error: 'Failed to delete circuit' },
            { status: 500 }
        );
    }
}
