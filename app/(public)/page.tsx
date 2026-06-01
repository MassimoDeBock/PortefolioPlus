import { db } from '@/lib/db';
import { contentItems } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { ContentItem } from '@/lib/db/schema';
import { ColorWheel } from '@/components/public/ColorWheel';
import { ExpandableDescription } from '@/components/public/ExpandableDescription';
import { ProjectsSection } from '@/components/public/ProjectsSection';

export const revalidate = 3600;

function m(item: ContentItem, key: string): string {
  return ((item.metadata as Record<string, unknown> | null)?.[key] as string) ?? '';
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>
      <span style={{ opacity: 0.5 }}>//</span> {label}
    </p>
  );
}

const SKILL_CATEGORY_ORDER = ['language', 'framework', 'tool', 'soft', 'other'];

export default async function HomePage() {
  const [metaItem] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.type, 'meta'));

  const [projects, experience, skills, education] = await Promise.all([
    db.select().from(contentItems).where(eq(contentItems.type, 'project')).orderBy(desc(contentItems.startDate)),
    db.select().from(contentItems).where(eq(contentItems.type, 'experience')).orderBy(desc(contentItems.startDate)),
    db.select().from(contentItems).where(eq(contentItems.type, 'skill')),
    db.select().from(contentItems).where(eq(contentItems.type, 'education')).orderBy(desc(contentItems.startDate)),
  ]);

  const rawMeta = (metaItem?.metadata ?? {}) as Record<string, unknown>;
  const meta = {
    full_name: rawMeta.full_name as string | undefined,
    bio_short: rawMeta.bio_short as string | undefined,
    bio_long: rawMeta.bio_long as string | undefined,
    email: rawMeta.email as string | undefined,
    location: rawMeta.location as string | undefined,
    linkedin: rawMeta.linkedin as string | undefined,
    github: rawMeta.github as string | undefined,
    website: rawMeta.website as string | undefined,
  };

  // Collect all unique keywords from every project's tech + tags
  const projectKeywords = Array.from(
    new Set(
      projects.flatMap(p => [
        ...((p.tech as string[] | null) ?? []),
        ...((p.tags as string[] | null) ?? []),
      ]).map(k => k.toLowerCase())
    )
  ).sort();

  const skillsByCategory = skills.reduce<Record<string, ContentItem[]>>((acc, skill) => {
    const cat = (((skill.metadata as Record<string, unknown> | null)?.category) as string) || 'other';
    (acc[cat] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <main className="min-h-screen" style={{ color: 'var(--text-primary)' }}>
      <ColorWheel />

      {/* Hero */}
      <div className="cyber-card cyber-card--hero mx-4 mt-8 sm:mx-8 lg:mx-auto lg:max-w-3xl">
        <section className="cyber-card-inner px-8 pt-10 pb-8">
          <h1
            className="text-center text-4xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)', textShadow: 'var(--name-shadow)' }}
          >
            {meta.full_name ?? 'Portfolio'}
          </h1>

          {meta.bio_short && (
            <p className="mt-2 text-center text-base" style={{ color: 'var(--text-role)' }}>
              {meta.bio_short}
            </p>
          )}

          <div className="my-6" style={{ borderTop: '1px solid rgba(var(--accent-rgb), 0.15)' }} />

          {meta.bio_long && (
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
              {meta.bio_long}
            </p>
          )}

          {/* Contact */}
          <div className="space-y-2">
            {meta.email && (
              <div className="contact-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                </svg>
                <a href={`mailto:${meta.email}`} className="cyber-link">{meta.email}</a>
              </div>
            )}
            {meta.location && (
              <div className="contact-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span>{meta.location}</span>
              </div>
            )}
            {meta.linkedin && (
              <div className="contact-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="3"/><line x1="8" y1="11" x2="8" y2="16"/><line x1="8" y1="8" x2="8" y2="8.5"/><path d="M12 16v-5M16 16v-3a2 2 0 0 0-4 0"/>
                </svg>
                <a href={meta.linkedin} target="_blank" rel="noopener noreferrer" className="cyber-link">
                  {meta.linkedin.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {meta.github && (
              <div className="contact-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                <a href={meta.github} target="_blank" rel="noopener noreferrer" className="cyber-link">
                  {meta.github.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {meta.website && (
              <div className="contact-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <a href={meta.website} target="_blank" rel="noopener noreferrer" className="cyber-link">
                  {meta.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mx-4 sm:mx-8 lg:mx-auto lg:max-w-3xl py-10 space-y-10">

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>
              <span style={{ opacity: 0.5 }}>//</span> projects
            </p>
            <ProjectsSection projects={projects} keywords={projectKeywords} />
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="cyber-card cyber-card--dim">
            <section className="cyber-card-inner p-6">
              <SectionHeader label="experience" />
              <div className="space-y-6">
                {experience.map((c) => {
                  const highlights = (((c.metadata as Record<string, unknown> | null)?.highlights) as string[]) ?? [];
                  return (
                    <div key={c.id} className="item-block">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                        <p className="text-xs whitespace-nowrap" style={{ color: 'var(--text-body)' }}>
                          {[c.startDate, c.endDate ?? 'Present'].filter(Boolean).join(' – ')}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {[m(c, 'company'), m(c, 'location')].filter(Boolean).join(' · ')}
                        </p>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="cyber-link text-xs font-mono whitespace-nowrap">
                            website ↗
                          </a>
                        )}
                      </div>
                      {highlights.length > 0 && (
                        <ul className="space-y-1 text-sm">
                          {highlights.map((h, k) => (
                            <li key={k} className="flex gap-2">
                              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
                              <span style={{ color: 'var(--text-body)' }}>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {!highlights.length && c.summary && (
                        <ExpandableDescription description={c.summary} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="cyber-card cyber-card--dim">
            <section className="cyber-card-inner p-6">
              <SectionHeader label="skills" />
              <div className="space-y-4">
                {SKILL_CATEGORY_ORDER.filter(cat => skillsByCategory[cat]?.length).map(cat => (
                  <div key={cat}>
                    <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skillsByCategory[cat].map((s) => (
                        <span key={s.id} className="skill-tag">{s.title}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="cyber-card cyber-card--dim">
            <section className="cyber-card-inner p-6">
              <SectionHeader label="education" />
              <div className="space-y-4">
                {education.map((c) => (
                  <div key={c.id} className="item-block">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {[m(c, 'institution'), m(c, 'degree'), m(c, 'field')].filter(Boolean).join(' · ')}
                    </p>
                    {m(c, 'grade') && (
                      <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                        {m(c, 'grade')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      </div>

      <footer
        className="border-t px-6 py-8 text-center text-xs font-mono"
        style={{ borderColor: 'var(--footer-border)', color: 'var(--text-muted)', opacity: 0.5 }}
      >
        {meta.full_name ?? 'Portfolio'}
      </footer>
    </main>
  );
}
