import { db } from '@/lib/db';
import { cvs, contentItems } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { unstable_noStore } from 'next/cache';
import type { ContentItem } from '@/lib/db/schema';
import { ColorWheel } from '@/components/public/ColorWheel';
import { ExpandableDescription } from '@/components/public/ExpandableDescription';
import { TechTags } from '@/components/public/TechTags';

export const dynamic = 'force-dynamic';

type SectionItem = { content_id: string; highlights?: string[]; order: number; visible?: boolean };
type Section =
  | { type: 'header'; visible: boolean; content_id: string }
  | { type: 'summary'; visible: boolean; content: string }
  | { type: 'experience' | 'projects' | 'education'; visible: boolean; items: SectionItem[] }
  | { type: 'skills'; visible: boolean; items: SectionItem[] };

type CvDocument = { sections: Section[] };

function byId(library: ContentItem[], id: string) {
  return library.find(c => c.id === id);
}

function meta(item: ContentItem, key: string): string {
  return ((item.metadata as Record<string, unknown> | null)?.[key] as string) ?? '';
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>
      <span style={{ opacity: 0.5 }}>//</span> {label}
    </p>
  );
}

export default async function CompanyPage({ params }: { params: { hash: string } }) {
  unstable_noStore();
  const [cv] = await db.select().from(cvs).where(eq(cvs.hash, params.hash));
  if (!cv) notFound();
  if (cv.expiresAt && new Date(cv.expiresAt) < new Date()) notFound();

  db.update(cvs)
    .set({ viewCount: (cv.viewCount ?? 0) + 1 })
    .where(eq(cvs.hash, params.hash))
    .catch(() => {});

  const doc = cv.cvDocument as CvDocument;
  const sections = doc?.sections ?? [];

  const ids: string[] = [];
  for (const section of sections) {
    if ('content_id' in section && section.content_id) ids.push(section.content_id);
    if ('items' in section) {
      for (const item of section.items ?? []) ids.push(item.content_id);
    }
  }
  const library = ids.length > 0
    ? await db.select().from(contentItems).where(inArray(contentItems.id, ids))
    : [];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  const headerSection = sections.find(s => s.type === 'header') as Extract<Section, { type: 'header' }> | undefined;
  const headerItem = headerSection ? byId(library, headerSection.content_id) : null;
  const rawHeaderMeta = (headerItem?.metadata ?? {}) as Record<string, unknown>;
  const headerMeta = {
    full_name: rawHeaderMeta.full_name as string | undefined,
    email:     rawHeaderMeta.email     as string | undefined,
    phone:     rawHeaderMeta.phone     as string | undefined,
    location:  rawHeaderMeta.location  as string | undefined,
    linkedin:  rawHeaderMeta.linkedin  as string | undefined,
    github:    rawHeaderMeta.github    as string | undefined,
    website:   rawHeaderMeta.website   as string | undefined,
  };

  return (
    <main className="min-h-screen" style={{ color: 'var(--text-primary)' }}>
      <ColorWheel />

      {/* Hero Header */}
      <div className="cyber-card cyber-card--hero mx-4 mt-8 sm:mx-8 lg:mx-auto lg:max-w-3xl">
        <section className="cyber-card-inner px-8 pt-10 pb-8">

          {/* Name — centered */}
          <h1
            className="text-center text-4xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)', textShadow: 'var(--name-shadow)' }}
          >
            {headerMeta.full_name ?? cv.roleTitle}
          </h1>

          {/* Role + tailored badge — centered inline */}
          <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
            <p className="text-base" style={{ color: 'var(--text-role)' }}>{cv.roleTitle}</p>
            <span className="cyber-badge">tailored for {cv.companyName}</span>
          </div>

          {/* Divider */}
          <div className="my-6" style={{ borderTop: '1px solid rgba(var(--accent-rgb), 0.15)' }} />

          {/* Contacts + Download — side by side */}
          <div className="flex items-end justify-between gap-6 flex-wrap">

            {/* Contact rows */}
            <div className="space-y-2">
              {headerMeta.email && (
                <div className="contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                  </svg>
                  <span>{headerMeta.email}</span>
                </div>
              )}
              {headerMeta.phone && (
                <div className="contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>
                  </svg>
                  <span>{headerMeta.phone}</span>
                </div>
              )}
              {headerMeta.location && (
                <div className="contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  <span>{headerMeta.location}</span>
                </div>
              )}
              {headerMeta.linkedin && (
                <div className="contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="2" width="20" height="20" rx="3"/><line x1="8" y1="11" x2="8" y2="16"/><line x1="8" y1="8" x2="8" y2="8.5"/><path d="M12 16v-5M16 16v-3a2 2 0 0 0-4 0"/>
                  </svg>
                  <a href={headerMeta.linkedin} target="_blank" rel="noopener noreferrer" className="cyber-link">
                    {headerMeta.linkedin.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {headerMeta.github && (
                <div className="contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  <a href={headerMeta.github} target="_blank" rel="noopener noreferrer" className="cyber-link">
                    {headerMeta.github.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {headerMeta.website && (
                <div className="contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>{headerMeta.website}</span>
                </div>
              )}
            </div>

            {/* Download button — chamfered top-left, two-layer border */}
            <a href={`/api/cv/export-pdf?hash=${cv.hash}`} className="cyber-dl-btn">
              <span className="cyber-dl-btn-inner">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v13M7 12l5 5 5-5"/><line x1="4" y1="20" x2="20" y2="20"/>
                </svg>
                Download PDF
              </span>
            </a>

          </div>
        </section>
      </div>

      {/* Content sections */}
      <div className="mx-4 sm:mx-8 lg:mx-auto lg:max-w-3xl py-10 space-y-6">
        {sections.map((section, i) => {
          if (!section.visible) return null;
          if (section.type === 'header') return null;

          if (section.type === 'summary') {
            return (
              <div key={i} className="cyber-card cyber-card--dim">
                <section className="cyber-card-inner p-6">
                  <SectionHeader label="summary" />
                  <p className="leading-relaxed text-sm" style={{ color: 'var(--text-body)' }}>
                    {section.content}
                  </p>
                </section>
              </div>
            );
          }

          if (section.type === 'experience') {
            const items = [...section.items].sort((a, b) => a.order - b.order).filter(it => it.visible !== false);
            if (!items.length) return null;
            return (
              <div key={i} className="cyber-card cyber-card--dim">
                <section className="cyber-card-inner p-6">
                  <SectionHeader label="experience" />
                  <div className="space-y-6">
                    {items.map((item, j) => {
                      const c = byId(library, item.content_id);
                      if (!c) return null;
                      return (
                        <div key={j} className="item-block">
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                            <p className="text-xs whitespace-nowrap" style={{ color: 'var(--text-body)' }}>
                              {[c.startDate, c.endDate ?? 'Present'].join(' – ')}
                            </p>
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{meta(c, 'company')}</p>
                          {(item.highlights ?? []).length > 0 && (
                            <ul className="space-y-1 text-sm">
                              {item.highlights!.map((h, k) => (
                                <li key={k} className="flex gap-2">
                                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
                                  <span style={{ color: 'var(--text-body)' }}>{h}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {c.summary && <ExpandableDescription description={c.summary} />}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            );
          }

          if (section.type === 'projects') {
            const items = [...section.items].sort((a, b) => a.order - b.order).filter(it => it.visible !== false);
            if (!items.length) return null;
            return (
              <div key={i} className="cyber-card cyber-card--dim">
                <section className="cyber-card-inner p-6">
                  <SectionHeader label="projects" />
                  <div className="space-y-6">
                    {items.map((item, j) => {
                      const c = byId(library, item.content_id);
                      if (!c) return null;
                      const tech = (c.tech as string[] | null) ?? [];
                      return (
                        <div key={j} className="item-block">
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                            <div className="flex gap-3 shrink-0">
                              {c.url && (
                                <a href={c.url} target="_blank" rel="noopener noreferrer" className="cyber-link text-xs font-mono whitespace-nowrap">
                                  live ↗
                                </a>
                              )}
                              {c.repoUrl && (
                                <a href={c.repoUrl} target="_blank" rel="noopener noreferrer" className="cyber-link text-xs font-mono whitespace-nowrap">
                                  source ↗
                                </a>
                              )}
                            </div>
                          </div>
                          {tech.length > 0 && <TechTags tech={tech} />}
                          {(item.highlights ?? []).length > 0 && (
                            <ul className="space-y-1 text-sm">
                              {item.highlights!.map((h, k) => (
                                <li key={k} className="flex gap-2">
                                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
                                  <span style={{ color: 'var(--text-body)' }}>{h}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {c.summary && <ExpandableDescription description={c.summary} />}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            );
          }

          if (section.type === 'skills') {
            const items = [...section.items].sort((a, b) => a.order - b.order).filter(it => it.visible !== false);
            if (!items.length) return null;
            return (
              <div key={i} className="cyber-card cyber-card--dim">
                <section className="cyber-card-inner p-6">
                  <SectionHeader label="skills" />
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, j) => {
                      const c = byId(library, item.content_id);
                      if (!c) return null;
                      return (
                        <span key={j} className="skill-tag">{c.title}</span>
                      );
                    })}
                  </div>
                </section>
              </div>
            );
          }

          if (section.type === 'education') {
            const items = [...section.items]
              .filter(it => it.visible !== false)
              .map(it => ({ it, c: byId(library, it.content_id) }))
              .filter(({ c }) => !!c)
              .sort((a, b) => (b.c!.startDate ?? '').localeCompare(a.c!.startDate ?? ''));
            if (!items.length) return null;
            return (
              <div key={i} className="cyber-card cyber-card--dim">
                <section className="cyber-card-inner p-6">
                  <SectionHeader label="education" />
                  <div className="space-y-4">
                    {items.map(({ it, c }, j) => (
                      <div key={j} className="item-block">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c!.title}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {[meta(c!, 'institution'), meta(c!, 'degree'), meta(c!, 'field')].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            );
          }

          return null;
        })}
      </div>

      <footer
        className="border-t px-6 py-8 text-center text-xs font-mono"
        style={{ borderColor: 'var(--footer-border)', color: 'var(--text-muted)', opacity: 0.5 }}
      >
        <p>
          tailored for {cv.companyName} ·{' '}
          <a href={baseUrl} className="footer-link">
            view portfolio
          </a>
        </p>
      </footer>
    </main>
  );
}
