import { db } from '@/lib/db';
import { contentItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { ContentItem } from '@/lib/db/schema';
import { ColorWheel } from '@/components/public/ColorWheel';
import { TechTags } from '@/components/public/TechTags';

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

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const [project] = await db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.slug, params.slug), eq(contentItems.type, 'project')));

  if (!project) notFound();

  const tech = (project.tech as string[] | null) ?? [];
  const images = (project.images as string[] | null) ?? [];
  const highlights = (((project.metadata as Record<string, unknown> | null)?.highlights) as string[]) ?? [];
  const role = m(project, 'role');

  return (
    <main className="min-h-screen" style={{ color: 'var(--text-primary)' }}>
      <ColorWheel />

      {/* Back link */}
      <div className="mx-4 mt-6 sm:mx-8 lg:mx-auto lg:max-w-3xl">
        <a
          href="/"
          className="font-mono text-xs"
          style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          back to portfolio
        </a>
      </div>

      {/* Hero */}
      <div className="cyber-card cyber-card--hero mx-4 mt-4 sm:mx-8 lg:mx-auto lg:max-w-3xl">
        <section className="cyber-card-inner px-8 pt-10 pb-8">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)', textShadow: 'var(--name-shadow)' }}
          >
            {project.title}
          </h1>

          <div className="mt-2 flex items-center gap-4 flex-wrap">
            {role && (
              <p className="text-sm" style={{ color: 'var(--text-role)' }}>{role}</p>
            )}
            {(project.startDate || project.endDate) && (
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {[project.startDate, project.endDate ?? 'Present'].filter(Boolean).join(' – ')}
              </p>
            )}
          </div>

          {tech.length > 0 && (
            <div className="mt-4">
              <TechTags tech={tech} />
            </div>
          )}

          <div className="my-5" style={{ borderTop: '1px solid rgba(var(--accent-rgb), 0.15)' }} />

          {/* Links */}
          <div className="flex gap-4 flex-wrap">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-dl-btn"
              >
                <span className="cyber-dl-btn-inner">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Live site ↗
                </span>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-dl-btn"
              >
                <span className="cyber-dl-btn-inner">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  Source ↗
                </span>
              </a>
            )}
          </div>
        </section>
      </div>

      <div className="mx-4 sm:mx-8 lg:mx-auto lg:max-w-3xl py-8 space-y-6">

        {/* Images */}
        {images.length > 0 && (
          <div className="cyber-card cyber-card--dim">
            <div className="cyber-card-inner p-4">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '8px',
                }}
              >
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    style={{
                      width: '100%',
                      borderRadius: '2px',
                      objectFit: 'cover',
                      maxHeight: images.length === 1 ? '400px' : '220px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {(project.description || project.summary) && (
          <div className="cyber-card cyber-card--dim">
            <section className="cyber-card-inner p-6">
              <SectionHeader label="about" />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
                {project.description ?? project.summary}
              </p>
            </section>
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="cyber-card cyber-card--dim">
            <section className="cyber-card-inner p-6">
              <SectionHeader label="highlights" />
              <ul className="space-y-2 text-sm">
                {highlights.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
                    <span style={{ color: 'var(--text-body)' }}>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

      </div>

      <footer
        className="border-t px-6 py-8 text-center text-xs font-mono"
        style={{ borderColor: 'var(--footer-border)', color: 'var(--text-muted)', opacity: 0.5 }}
      >
        <a href="/" className="footer-link">← back to portfolio</a>
      </footer>
    </main>
  );
}
