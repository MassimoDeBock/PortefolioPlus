import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cvs, contentItems } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';

type CvDocument = {
  sections?: Array<{
    type: string;
    items?: Array<{ content_id?: string }>;
  }>;
};

export async function GET(_req: NextRequest, { params }: { params: { hash: string } }) {
  const [cv] = await db.select().from(cvs).where(eq(cvs.hash, params.hash));
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Collect all content_ids referenced in cv_document (section level + item level)
  const doc = cv.cvDocument as CvDocument;
  const ids: string[] = [];
  for (const section of doc?.sections ?? []) {
    if ((section as { content_id?: string }).content_id) {
      ids.push((section as { content_id: string }).content_id);
    }
    for (const item of section.items ?? []) {
      if (item.content_id) ids.push(item.content_id);
    }
  }

  const library =
    ids.length > 0
      ? await db.select().from(contentItems).where(inArray(contentItems.id, ids))
      : [];

  return NextResponse.json({ cv, library });
}

export async function PUT(req: NextRequest, { params }: { params: { hash: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const [updated] = await db
    .update(cvs)
    .set({
      cvDocument: body.cvDocument ?? undefined,
      customSummary: body.customSummary ?? undefined,
      webpageConfig: body.webpageConfig ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(cvs.hash, params.hash))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
