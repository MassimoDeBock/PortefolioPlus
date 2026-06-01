import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contentItems } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [item] = await db.select().from(contentItems).where(eq(contentItems.id, params.id));
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const [item] = await db
    .update(contentItems)
    .set({
      type: body.type,
      title: body.title,
      slug: body.slug ?? null,
      summary: body.summary ?? null,
      description: body.description ?? null,
      tech: body.tech ?? [],
      tags: body.tags ?? [],
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      url: body.url ?? null,
      repoUrl: body.repoUrl ?? null,
      images: body.images ?? [],
      metadata: body.metadata ?? {},
      updatedAt: new Date(),
    })
    .where(eq(contentItems.id, params.id))
    .returning();

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(contentItems).where(eq(contentItems.id, params.id));
  return new NextResponse(null, { status: 204 });
}
