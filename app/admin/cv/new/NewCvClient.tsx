'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';

export function NewCvClient() {
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [jobPost, setJobPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const hash = nanoid(8);

    try {
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, companyName, roleTitle, jobPost }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Generation failed');
      }

      window.location.href = `/admin/cv/${hash}/edit`;
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  const inputCls = 'w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Company name *</label>
        <input
          required
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          className={inputCls}
          placeholder="Acme Corp"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role title *</label>
        <input
          required
          value={roleTitle}
          onChange={e => setRoleTitle(e.target.value)}
          className={inputCls}
          placeholder="Frontend Engineer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Job description *</label>
        <textarea
          required
          rows={14}
          value={jobPost}
          onChange={e => setJobPost(e.target.value)}
          className={inputCls}
          placeholder="Paste the full job posting here…"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Generating CV…' : 'Generate CV'}
      </button>

      {loading && (
        <p className="text-center text-xs text-gray-400">
          Asking AI to tailor your CV — this takes a few seconds…
        </p>
      )}
    </form>
  );
}
