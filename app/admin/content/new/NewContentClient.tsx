'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentForm, formValuesToApiBody, type ContentFormValues } from '@/components/content/ContentForm';

type Tab = 'manual' | 'ai' | 'json';

const CONTENT_TYPES = ['project', 'experience', 'education', 'skill', 'meta'] as const;

export function NewContentClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('manual');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // AI tab state
  const [aiType, setAiType] = useState<string>('project');
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrefill, setAiPrefill] = useState<Partial<ContentFormValues> | null>(null);

  // JSON tab state
  const [jsonText, setJsonText] = useState('');
  const [jsonParsed, setJsonParsed] = useState<Partial<ContentFormValues> | null>(null);
  const [jsonError, setJsonError] = useState('');

  async function saveItem(body: ReturnType<typeof formValuesToApiBody>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = '/admin/content';
    } catch (e) {
      setError(String(e));
      setSaving(false);
    }
  }

  async function handleManualSubmit(values: ContentFormValues) {
    await saveItem(formValuesToApiBody(values));
  }

  async function handleAiGenerate() {
    if (!aiDescription.trim()) return;
    setAiLoading(true);
    setAiPrefill(null);
    setError('');
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: aiType, description: aiDescription }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Map AI response to form values (partial)
      const highlights: string[] = data.metadata?.highlights ?? [];
      setAiPrefill({
        type: aiType as ContentFormValues['type'],
        title: data.title ?? '',
        slug: data.slug ?? '',
        summary: data.summary ?? '',
        description: data.description ?? '',
        tech: Array.isArray(data.tech) ? data.tech.join(', ') : '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        url: data.url ?? '',
        repoUrl: data.repoUrl ?? '',
        meta_role: data.metadata?.role ?? '',
        meta_highlights: highlights.join('\n'),
        meta_company: data.metadata?.company ?? '',
        meta_location: data.metadata?.location ?? '',
        meta_employment_type: data.metadata?.employment_type ?? 'full-time',
        meta_institution: data.metadata?.institution ?? '',
        meta_degree: data.metadata?.degree ?? '',
        meta_field: data.metadata?.field ?? '',
        meta_grade: data.metadata?.grade ?? '',
        meta_category: data.metadata?.category ?? 'other',
        meta_proficiency: data.metadata?.proficiency ?? 'intermediate',
        meta_full_name: data.metadata?.full_name ?? '',
        meta_email: data.metadata?.email ?? '',
        meta_phone: data.metadata?.phone ?? '',
        meta_linkedin: data.metadata?.linkedin ?? '',
        meta_github: data.metadata?.github ?? '',
        meta_website: data.metadata?.website ?? '',
        meta_bio_short: data.metadata?.bio_short ?? '',
        meta_bio_long: data.metadata?.bio_long ?? '',
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setAiLoading(false);
    }
  }

  function handleJsonParse() {
    setJsonError('');
    setJsonParsed(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.type || !CONTENT_TYPES.includes(parsed.type)) {
        setJsonError('Missing or invalid "type" field. Must be one of: ' + CONTENT_TYPES.join(', '));
        return;
      }
      if (!parsed.title) {
        setJsonError('"title" is required.');
        return;
      }
      setJsonParsed(parsed);
    } catch {
      setJsonError('Invalid JSON — check your syntax.');
    }
  }

  const tabBtn = (t: Tab, label: string) =>
    `px-4 py-2 text-sm font-medium border-b-2 ${
      tab === t ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-0 border-b mb-6">
        <button className={tabBtn('manual', 'Manual')} onClick={() => setTab('manual')}>Manual</button>
        <button className={tabBtn('ai', 'AI-assisted')} onClick={() => setTab('ai')}>AI-assisted</button>
        <button className={tabBtn('json', 'JSON import')} onClick={() => setTab('json')}>JSON import</button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Manual tab */}
      {tab === 'manual' && (
        <ContentForm
          onSubmit={handleManualSubmit}
          isLoading={saving}
          submitLabel="Save"
        />
      )}

      {/* AI-assisted tab */}
      {tab === 'ai' && (
        <div>
          {!aiPrefill ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={aiType}
                  onChange={e => setAiType(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Describe in your own words</label>
                <textarea
                  rows={6}
                  value={aiDescription}
                  onChange={e => setAiDescription(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. I built a SaaS dashboard with Next.js and Supabase for a B2B client. I was the sole developer. It handled billing, user management and analytics."
                />
              </div>
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiDescription.trim()}
                className="rounded bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {aiLoading ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <span>AI has pre-filled the form. Review and edit before saving.</span>
                <button onClick={() => setAiPrefill(null)} className="text-blue-500 hover:underline ml-4">
                  Start over
                </button>
              </div>
              <ContentForm
                initialValues={aiPrefill}
                onSubmit={handleManualSubmit}
                isLoading={saving}
                submitLabel="Save"
              />
            </div>
          )}
        </div>
      )}

      {/* JSON import tab */}
      {tab === 'json' && (
        <div className="space-y-4">
          {!jsonParsed ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Paste JSON</label>
                <textarea
                  rows={12}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                  className="w-full rounded border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={'{\n  "type": "project",\n  "title": "My Project",\n  ...\n}'}
                />
              </div>
              {jsonError && (
                <p className="text-sm text-red-600">{jsonError}</p>
              )}
              <button
                onClick={handleJsonParse}
                disabled={!jsonText.trim()}
                className="rounded bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Preview
              </button>
            </>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between rounded bg-green-50 px-3 py-2 text-sm text-green-700">
                <span>JSON parsed successfully. Review the form below and save.</span>
                <button onClick={() => setJsonParsed(null)} className="text-green-600 hover:underline ml-4">
                  Edit JSON
                </button>
              </div>
              <ContentForm
                initialValues={jsonParsed}
                onSubmit={handleManualSubmit}
                isLoading={saving}
                submitLabel="Save"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
