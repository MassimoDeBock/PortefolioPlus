'use client';

import { useState } from 'react';
import type { ContentItem } from '@/lib/db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = 'header' | 'summary' | 'experience' | 'projects' | 'skills' | 'education';

interface SectionItem {
  content_id: string;
  highlights?: string[];
  order: number;
  visible?: boolean;
}

interface Section {
  type: SectionType;
  visible: boolean;
  content_id?: string;  // header section
  content?: string;     // summary section
  items?: SectionItem[];
}

interface CvDocument {
  sections: Section[];
}

interface Props {
  hash: string;
  initialCvDocument: CvDocument;
  initialSummary: string;
  library: ContentItem[];
  allProjects: ContentItem[];
  generationModel?: string;
  baseUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function contentById(library: ContentItem[], id: string) {
  return library.find(c => c.id === id);
}

function metaField(item: ContentItem, key: string): string {
  const m = item.metadata as Record<string, unknown> | null;
  return (m?.[key] as string) ?? '';
}

// ─── Editor ──────────────────────────────────────────────────────────────────

export function CvEditor({ hash, initialCvDocument, initialSummary, library, allProjects, generationModel, baseUrl }: Props) {
  const [doc, setDoc] = useState<CvDocument>(initialCvDocument);
  // Merged library: referenced items + any projects added manually
  const [extLibrary, setExtLibrary] = useState<ContentItem[]>(library);
  const [summary, setSummary] = useState(initialSummary);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const publicUrl = `${baseUrl}/company/${hash}`;

  function updateSection(idx: number, patch: Partial<Section>) {
    setDoc(d => {
      const sections = [...d.sections];
      sections[idx] = { ...sections[idx], ...patch };
      return { ...d, sections };
    });
  }

  function updateItem(sectionIdx: number, itemIdx: number, patch: Partial<SectionItem>) {
    setDoc(d => {
      const sections = [...d.sections];
      const items = [...(sections[sectionIdx].items ?? [])];
      items[itemIdx] = { ...items[itemIdx], ...patch };
      sections[sectionIdx] = { ...sections[sectionIdx], items };
      return { ...d, sections };
    });
  }

  function updateHighlights(sectionIdx: number, itemIdx: number, raw: string) {
    // Store raw splits while typing — trailing spaces and empty lines are preserved
    // so the cursor doesn't jump. Trimming happens on save.
    updateItem(sectionIdx, itemIdx, { highlights: raw.split('\n') });
  }

  // Sync summary section content with the summary field
  function handleSummaryChange(val: string) {
    setSummary(val);
    setDoc(d => {
      const sections = d.sections.map(s =>
        s.type === 'summary' ? { ...s, content: val } : s
      );
      return { ...d, sections };
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const cleanedDoc: CvDocument = {
        ...doc,
        sections: doc.sections.map(s => ({
          ...s,
          items: s.items?.map(it => ({
            ...it,
            highlights: it.highlights?.map(h => h.trim()).filter(Boolean),
          })),
        })),
      };
      const res = await fetch(`/api/cv/${hash}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvDocument: cleanedDoc, customSummary: summary }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const SECTION_LABELS: Record<SectionType, string> = {
    header: 'Header',
    summary: 'Summary',
    experience: 'Experience',
    projects: 'Projects',
    skills: 'Skills',
    education: 'Education',
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded border bg-white px-4 py-3 shadow-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Public URL</p>
          <a href={publicUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
            {publicUrl}
          </a>
          {generationModel && (
            <p className="text-xs text-gray-400 font-mono">model: {generationModel}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Saved!</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
          <a
            href={`/api/cv/export-pdf?hash=${hash}`}
            target="_blank"
            className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50"
          >
            Export PDF
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-black px-4 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Sections */}
      {doc.sections.map((section, sIdx) => (
        <div key={section.type} className={`rounded border bg-white shadow-sm ${!section.visible ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">{SECTION_LABELS[section.type] ?? section.type}</h2>
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={section.visible}
                onChange={e => updateSection(sIdx, { visible: e.target.checked })}
                className="rounded"
              />
              Show in PDF
            </label>
          </div>

          <div className="p-4">
            {/* Header — read-only, populated from profile */}
            {section.type === 'header' && (() => {
              const meta = section.content_id ? contentById(extLibrary, section.content_id) : null;
              const m = (meta?.metadata ?? {}) as Record<string, unknown>;
              return (
                <div className="text-sm text-gray-500 space-y-0.5">
                  <p className="font-medium text-gray-800">{String(m.full_name ?? '')}</p>
                  <p>{[m.email, m.phone, m.location].filter(Boolean).join(' · ')}</p>
                  <p>{[m.linkedin, m.github, m.website].filter(Boolean).join(' · ')}</p>
                  <p className="text-xs text-gray-400 pt-1">Auto-populated from your profile — edit via Content Library.</p>
                </div>
              );
            })()}

            {/* Summary */}
            {section.type === 'summary' && (
              <textarea
                rows={4}
                value={summary}
                onChange={e => handleSummaryChange(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Tailored summary paragraph…"
              />
            )}

            {/* Experience / Projects / Education */}
            {(section.type === 'experience' || section.type === 'projects' || section.type === 'education') && <>
              {(section.items ?? [])
                .sort((a, b) => a.order - b.order)
                .map((item, iIdx) => {
                  const content = contentById(extLibrary, item.content_id);
                  if (!content) return (
                    <div key={iIdx} className="mb-3 text-sm text-red-400">
                      Missing content item: {item.content_id}
                    </div>
                  );

                  const meta = content.metadata as Record<string, unknown> | null ?? {};
                  const subtitle = section.type === 'experience'
                    ? String(meta.company ?? '')
                    : section.type === 'education'
                    ? `${meta.institution ?? ''} · ${meta.degree ?? ''} ${meta.field ?? ''}`
                    : (content.tech as string[] | null ?? []).slice(0, 4).join(', ');

                  return (
                    <div key={iIdx} className={`mb-4 rounded border p-3 ${item.visible === false ? 'opacity-40' : ''}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-sm">{content.title}</p>
                          <p className="text-xs text-gray-500">{subtitle}</p>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={item.visible !== false}
                            onChange={e => updateItem(sIdx, iIdx, { visible: e.target.checked })}
                            className="rounded"
                          />
                          Include
                        </label>
                      </div>
                      {section.type !== 'education' && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Highlights (one per line)</p>
                          <textarea
                            rows={Math.max(2, (item.highlights?.length ?? 2) + 1)}
                            value={(item.highlights ?? []).join('\n')}
                            onChange={e => updateHighlights(sIdx, iIdx, e.target.value)}
                            className="w-full rounded border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Add project button — only on the projects section */}
              {section.type === 'projects' && (() => {
                const usedIds = new Set((section.items ?? []).map(i => i.content_id));
                const available = allProjects.filter(p => !usedIds.has(p.id));
                if (!available.length) return null;
                return (
                  <div className="mt-2">
                    <select
                      className="w-full rounded border px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
                      value=""
                      onChange={e => {
                        const project = allProjects.find(p => p.id === e.target.value);
                        if (!project) return;
                        // Add to extended library if not already there
                        setExtLibrary(lib => lib.find(l => l.id === project.id) ? lib : [...lib, project]);
                        const nextOrder = Math.max(0, ...(section.items ?? []).map(i => i.order)) + 1;
                        updateSection(sIdx, {
                          items: [...(section.items ?? []), { content_id: project.id, highlights: [], order: nextOrder, visible: true }],
                        });
                      }}
                    >
                      <option value="">＋ add project…</option>
                      {available.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}
            </>}

            {/* Skills */}
            {section.type === 'skills' && (
              <div className="flex flex-wrap gap-2">
                {(section.items ?? [])
                  .sort((a, b) => a.order - b.order)
                  .map((item, iIdx) => {
                    const content = contentById(extLibrary, item.content_id);
                    if (!content) return null;
                    return (
                      <label key={iIdx} className="flex items-center gap-1.5 rounded border px-2 py-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.visible !== false}
                          onChange={e => updateItem(sIdx, iIdx, { visible: e.target.checked })}
                          className="rounded"
                        />
                        {content.title}
                        <span className="text-gray-400">({metaField(content, 'proficiency')})</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
