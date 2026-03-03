import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/contributors - List all contributors
export async function GET() {
    try {
        const contributors = await db.contributor.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        annotations: true,
                        circuitPaths: true,
                        comments: true,
                    },
                },
            },
        });

        return NextResponse.json(contributors);
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contributors' },
            { status: 500 }
        );
    }
}

// POST /api/contributors - Create a new contributor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, bio } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Contributor name is required' },
                { status: 400 }
            );
        }

        const contributor = await db.contributor.create({
            data: {
                name,
                email,
                bio,
            },
        });

        return NextResponse.json(contributor, { status: 201 });
    } catch (error) {
        console.error('Error creating contributor:', error);
        return NextResponse.json(
            { error: 'Failed to create contributor' },
            { status: 500 }
        );
    }
}
