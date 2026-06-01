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
        <div className="flex items-start gap-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{error}</span>
        </div>
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
        className="w-full rounded bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
        )}
        {loading ? 'Generating CV…' : 'Generate CV'}
      </button>

      {loading && (
        <p className="text-center text-xs text-gray-400">
          Asking the AI to tailor your CV — this usually takes 10–20 seconds…
        </p>
      )}
    </form>
  );
}
