import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { cvs } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function CvListPage() {
  noStore();
  const all = await db.select().from(cvs).orderBy(desc(cvs.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CVs</h1>
        <Link
          href="/admin/cv/new"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Generate CV
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="rounded border border-dashed p-12 text-center text-gray-400">
          <p className="text-lg">No CVs yet.</p>
          <p className="mt-1 text-sm">Generate your first tailored CV.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Public URL</th>
                <th className="px-4 py-3 text-left">Views</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {all.map(cv => (
                <tr key={cv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cv.companyName}</td>
                  <td className="px-4 py-3 text-gray-600">{cv.roleTitle}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/company/${cv.hash}`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-xs font-mono"
                    >
                      /company/{cv.hash}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cv.viewCount}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(cv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/cv/${cv.hash}/edit`} className="text-blue-600 hover:underline mr-4">
                      Edit
                    </Link>
                    <a
                      href={`/api/cv/export-pdf?hash=${cv.hash}`}
                      target="_blank"
                      className="text-gray-500 hover:underline mr-4"
                    >
                      PDF
                    </a>
                    <DeleteCvButton hash={cv.hash} />
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

function DeleteCvButton({ hash }: { hash: string }) {
  return (
    <form
      action={async () => {
        'use server';
        const { db } = await import('@/lib/db');
        const { cvs } = await import('@/lib/db/schema');
        const { eq } = await import('drizzle-orm');
        await db.delete(cvs).where(eq(cvs.hash, hash));
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/admin/cv');
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="text-red-500 hover:underline">Delete</button>
    </form>
  );
}
