import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contentItems } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') as typeof contentItems.$inferSelect['type'] | null;

  const rows = type
    ? await db.select().from(contentItems).where(eq(contentItems.type, type)).orderBy(desc(contentItems.createdAt))
    : await db.select().from(contentItems).orderBy(desc(contentItems.createdAt));

  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const [item] = await db
    .insert(contentItems)
    .values({
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
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
