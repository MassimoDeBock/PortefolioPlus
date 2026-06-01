export const dynamic = 'force-dynamic';

import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { contentItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { EditContentClient } from './EditContentClient';
import { apiItemToFormValues } from '@/components/content/ContentForm.utils';

export default async function EditContentPage({ params }: { params: { id: string } }) {
  noStore();
  const [item] = await db.select().from(contentItems).where(eq(contentItems.id, params.id));
  if (!item) notFound();

  const initialValues = apiItemToFormValues(item as unknown as Record<string, unknown>);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Content</h1>
      <EditContentClient id={params.id} initialValues={initialValues} />
    </div>
  );
}
