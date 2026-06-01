import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { contentItems } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

const TYPE_COLORS: Record<string, string> = {
  project: 'bg-blue-100 text-blue-700',
  experience: 'bg-green-100 text-green-700',
  education: 'bg-purple-100 text-purple-700',
  skill: 'bg-yellow-100 text-yellow-700',
  meta: 'bg-gray-100 text-gray-700',
};

export default async function ContentLibraryPage() {
  noStore();
  const items = await db.select().from(contentItems).orderBy(desc(contentItems.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Library</h1>
        <Link
          href="/admin/content/new"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Add content
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded border border-dashed p-12 text-center text-gray-400">
          <p className="text-lg">No content yet.</p>
          <p className="mt-1 text-sm">Add your first item to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Dates</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[item.type] ?? ''}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.startDate
                      ? `${item.startDate} → ${item.endDate ?? 'present'}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/content/${item.id}/edit`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        'use server';
        const { db } = await import('@/lib/db');
        const { contentItems } = await import('@/lib/db/schema');
        const { eq } = await import('drizzle-orm');
        await db.delete(contentItems).where(eq(contentItems.id, id));
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/admin/content');
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="text-red-500 hover:underline">
        Delete
      </button>
    </form>
  );
}
