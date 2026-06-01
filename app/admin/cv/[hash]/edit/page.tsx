export const dynamic = 'force-dynamic';

import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { cvs, contentItems } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { CvEditor } from '@/components/cv/CvEditor';

type CvDocument = {
  sections?: Array<{
    type: string;
    items?: Array<{ content_id?: string }>;
  }>;
};

export default async function EditCvPage({ params }: { params: { hash: string } }) {
  noStore();
  const [cv] = await db.select().from(cvs).where(eq(cvs.hash, params.hash));
  if (!cv) notFound();

  // Collect referenced content ids (section level + item level)
  const doc = cv.cvDocument as CvDocument;
  const ids: string[] = [];
  for (const section of doc?.sections ?? []) {
    const sid = (section as unknown as { content_id?: string }).content_id;
    if (sid) ids.push(sid);
    for (const item of section.items ?? []) {
      if (item.content_id) ids.push(item.content_id);
    }
  }

  const library =
    ids.length > 0
      ? await db.select().from(contentItems).where(inArray(contentItems.id, ids))
      : [];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{cv.companyName} — {cv.roleTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">Edit and export your tailored CV</p>
      </div>
      <CvEditor
        hash={cv.hash}
        initialCvDocument={cv.cvDocument as Parameters<typeof CvEditor>[0]['initialCvDocument']}
        initialSummary={cv.customSummary ?? ''}
        library={library}
        baseUrl={baseUrl}
      />
    </div>
  );
}
