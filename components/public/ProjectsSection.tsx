'use client';

import { useState, useMemo } from 'react';
import { FilmStrip } from './FilmStrip';
import type { ContentItem } from '@/lib/db/schema';

export function ProjectsSection({
  projects,
  keywords,
}: {
  projects: ContentItem[];
  keywords: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (kw: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(kw) ? next.delete(kw) : next.add(kw);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!selected.size) return projects;
    return projects.filter(p => {
      const tech = (p.tech as string[] | null) ?? [];
      const tags = (p.tags as string[] | null) ?? [];
      return [...tech, ...tags].some(t => selected.has(t.toLowerCase()));
    });
  }, [projects, selected]);

  return (
    <div>
      {/* Keyword chips */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {keywords.map(kw => {
            const active = selected.has(kw);
            return (
              <button
                key={kw}
                onClick={() => toggle(kw)}
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.68rem',
                  padding: '3px 10px',
                  background: active ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.08)',
                  border: `1px solid ${active ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.3)'}`,
                  color: active ? 'var(--bg)' : 'var(--text-body)',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                }}
              >
                {kw}
              </button>
            );
          })}
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.68rem',
                padding: '3px 10px',
                background: 'transparent',
                border: '1px solid rgba(var(--accent-rgb), 0.15)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              clear
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <FilmStrip projects={filtered} />
      ) : (
        <p className="text-sm font-mono text-center py-8" style={{ color: 'var(--text-muted)' }}>
          no projects match the selected filters
        </p>
      )}
    </div>
  );
}
