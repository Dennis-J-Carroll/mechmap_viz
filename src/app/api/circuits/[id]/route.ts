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
        const { name, description, circuitType, hypothesis, evidence, confidence, color, nodes, nodeId, connectionType, denoisingScore, noisingScore } = body;

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
                    connectionType?: string;
                    denoisingScore?: number;
                    noisingScore?: number;
                }) => ({
                    circuitPathId: id,
                    position: node.position,
                    componentType: node.componentType,
                    layerIndex: node.layerIndex,
                    headIndex: node.headIndex,
                    role: node.role,
                    signalType: node.signalType,
                    notes: node.notes,
                    connectionType: node.connectionType,
                    denoisingScore: node.denoisingScore,
                    noisingScore: node.noisingScore,
                })),
            });
        }

        // Single node field update (for patching scores, role, signalType, connectionType)
        if (nodeId) {
            await db.pathNode.update({
                where: { id: nodeId },
                data: {
                    ...(connectionType !== undefined && { connectionType }),
                    ...(denoisingScore !== undefined && { denoisingScore }),
                    ...(noisingScore !== undefined && { noisingScore }),
                    ...(body.role !== undefined && { role: body.role }),
                    ...(body.signalType !== undefined && { signalType: body.signalType }),
                    ...(body.notes !== undefined && { notes: body.notes }),
                },
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

// PATCH /api/circuits/[id] - Reorder nodes
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { nodeIds } = body;

        if (!nodeIds || !Array.isArray(nodeIds)) {
            return NextResponse.json({ error: 'nodeIds array required' }, { status: 400 });
        }

        // Fetch current nodes to preserve their data
        const currentNodes = await db.pathNode.findMany({
            where: { circuitPathId: id },
        });
        const nodeMap = Object.fromEntries(currentNodes.map(n => [n.id, n]));

        // Delete all nodes, then reinsert in new order
        await db.pathNode.deleteMany({ where: { circuitPathId: id } });
        await db.pathNode.createMany({
            data: nodeIds.map((nodeId: string, position: number) => {
                const node = nodeMap[nodeId];
                if (!node) throw new Error(`Node ${nodeId} not found`);
                return {
                    circuitPathId: id,
                    position,
                    componentType: node.componentType,
                    layerIndex: node.layerIndex,
                    headIndex: node.headIndex,
                    role: node.role,
                    signalType: node.signalType,
                    notes: node.notes,
                    connectionType: node.connectionType,
                    denoisingScore: node.denoisingScore,
                    noisingScore: node.noisingScore,
                };
            }),
        });

        // Return updated circuit
        const updated = await db.circuitPath.findUnique({
            where: { id },
            include: { nodes: { orderBy: { position: 'asc' } } },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error reordering circuit nodes:', error);
        return NextResponse.json({ error: 'Failed to reorder nodes' }, { status: 500 });
    }
}
