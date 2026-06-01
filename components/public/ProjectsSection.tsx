'use client';

import { useState, useMemo, useRef } from 'react';
import { FilmStrip } from './FilmStrip';
import type { ContentItem } from '@/lib/db/schema';

export function ProjectsSection({
  projects,
  keywords,
}: {
  projects: ContentItem[];
  keywords: string[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return keywords
      .filter(kw => !selected.includes(kw) && kw.includes(q))
      .slice(0, 8);
  }, [input, keywords, selected]);

  const add = (kw: string) => {
    setSelected(prev => prev.includes(kw) ? prev : [...prev, kw]);
    setInput('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (kw: string) => setSelected(prev => prev.filter(k => k !== kw));

  const filtered = useMemo(() => {
    if (!selected.length) return projects;
    return projects.filter(p => {
      const tech = (p.tech as string[] | null) ?? [];
      const tags = (p.tags as string[] | null) ?? [];
      return [...tech, ...tags].some(t => selected.includes(t.toLowerCase()));
    });
  }, [projects, selected]);

  return (
    <div>
      {/* Search input + active chips */}
      <div style={{ marginBottom: '20px' }}>
        {/* Input row */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--surface)',
              border: `1px solid ${open ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.25)'}`,
              padding: '6px 10px',
              transition: 'border-color 0.2s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setOpen(false); setInput(''); }
                if (e.key === 'Enter' && suggestions.length) { e.preventDefault(); add(suggestions[0]); }
              }}
              placeholder="filter by tech or tag…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.78rem',
                fontFamily: 'Space Mono, monospace',
                color: 'var(--text-primary)',
                minWidth: 0,
              }}
            />
            {(input || selected.length > 0) && (
              <button
                onMouseDown={e => { e.preventDefault(); setInput(''); setSelected([]); setOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 0,
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {open && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: 'var(--surface)',
                border: '1px solid rgba(var(--accent-rgb), 0.25)',
                borderTop: '1px solid var(--accent)',
                zIndex: 20,
                overflow: 'hidden',
              }}
            >
              {suggestions.map(kw => (
                <button
                  key={kw}
                  onMouseDown={e => { e.preventDefault(); add(kw); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(var(--accent-rgb), 0.08)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: 'Space Mono, monospace',
                    color: 'var(--text-body)',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--accent-rgb), 0.08)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-body)';
                  }}
                >
                  {kw}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {selected.map(kw => (
              <span
                key={kw}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                  border: '1px solid var(--accent)',
                }}
              >
                {kw}
                <button
                  onClick={() => remove(kw)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', opacity: 0.7 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

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
