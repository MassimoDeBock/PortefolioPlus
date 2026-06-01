export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <a href="/admin/content" className="rounded border p-4 hover:bg-gray-100">
          <h2 className="font-semibold">Content Library</h2>
          <p className="text-sm text-gray-500">Manage projects, experience, skills</p>
        </a>
        <a href="/admin/cv" className="rounded border p-4 hover:bg-gray-100">
          <h2 className="font-semibold">CVs</h2>
          <p className="text-sm text-gray-500">Generate and manage CVs</p>
        </a>
      </div>
    </div>
  );
}
