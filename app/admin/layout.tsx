import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-6">
        <Link href="/admin" className="font-semibold hover:text-gray-600">
          Admin
        </Link>
        <Link href="/admin/content" className="text-sm text-gray-500 hover:text-gray-900">
          Content Library
        </Link>
        <Link href="/admin/cv" className="text-sm text-gray-500 hover:text-gray-900">
          CVs
        </Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
