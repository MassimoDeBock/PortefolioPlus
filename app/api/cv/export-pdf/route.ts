import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cvs, contentItems } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

type CvDocument = {
  sections?: Array<{
    type: string;
    items?: Array<{ content_id?: string }>;
  }>;
};

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash');
  if (!hash) return NextResponse.json({ error: 'hash is required' }, { status: 400 });

  const [cv] = await db.select().from(cvs).where(eq(cvs.hash, hash));
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Collect all referenced content ids + meta item (for header)
  const doc = cv.cvDocument as CvDocument;
  const ids: string[] = [];
  for (const section of doc?.sections ?? []) {
    for (const item of section.items ?? []) {
      if (item.content_id) ids.push(item.content_id);
    }
  }

  // Fetch referenced items + any meta item (needed for header even if not in sections)
  const [referenced, metaItems] = await Promise.all([
    ids.length > 0
      ? db.select().from(contentItems).where(inArray(contentItems.id, ids))
      : Promise.resolve([]),
    db.select().from(contentItems).where(eq(contentItems.type, 'meta')).limit(1),
  ]);

  // Merge, dedup by id
  const seen = new Set<string>();
  const library = [...referenced, ...metaItems].filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  // Dynamic import to stay server-side only
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const { CvTemplate } = await import('@/lib/pdf/template');
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(CvTemplate, { cv, library, baseUrl }) as any
  );

  const filename = `CV-${cv.companyName.replace(/[^a-z0-9]/gi, '-')}-${cv.hash}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
