import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Svg, Path, Circle } from '@react-pdf/renderer';
import type { Cv, ContentItem } from '@/lib/db/schema';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#1a1a1a',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    lineHeight: 1.4,
  },
  // Header
  header: { marginBottom: 14 },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 22, textAlign: 'center', marginBottom: 10 },
  roleTitle: { fontSize: 11.5, color: '#444', textAlign: 'center', marginBottom: 14 },
  headerColumns: { flexDirection: 'row', gap: 16 },
  contactCol: { flex: 1 },
  contactLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 2 },
  contactItem: { fontSize: 8.5, color: '#555' },
  contactLink: { fontSize: 8.5, color: '#2563eb' },
  // Web version callout
  webCallout: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 0.75,
    borderColor: '#93c5fd',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  webCalloutHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#1d4ed8',
    marginBottom: 3,
  },
  webCalloutBody: { fontSize: 8, color: '#374151', marginBottom: 4 },
  webCalloutUrl: {
    fontSize: 8.5,
    color: '#1d4ed8',
    fontFamily: 'Helvetica-Bold',
  },
  // Section
  section: { marginTop: 14 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#555',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 2,
    marginBottom: 6,
  },
  // Experience / Project / Education block
  block: { marginBottom: 8 },
  blockTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  blockSubtitle: { fontSize: 8.5, color: '#666', marginBottom: 1 },
  blockTech: { fontSize: 8, color: '#666', fontStyle: 'italic', marginBottom: 3 },
  bullet: { flexDirection: 'row', marginTop: 1.5 },
  bulletDot: { width: 10, color: '#555' },
  bulletText: { flex: 1 },
  // Skills
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skillChip: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 8.5,
  },
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICON_SIZE = 9;
const ICON_COLOR = '#777';

function IconEmail() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        fill={ICON_COLOR}
      />
    </Svg>
  );
}

function IconPhone() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill={ICON_COLOR}
      />
    </Svg>
  );
}

function IconLocation() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        fill={ICON_COLOR}
      />
    </Svg>
  );
}

function IconLinkedIn() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-5 6h-2v8h2v-4.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V17h2v-4.5C21 10.01 19.49 9 17.5 9c-1.06 0-1.96.5-2.5 1.32V9zm-5 0H7v8h2V9zM8 7.5A1.5 1.5 0 0 0 8 4.5 1.5 1.5 0 0 0 8 7.5z"
        fill={ICON_COLOR}
      />
    </Svg>
  );
}

function IconGitHub() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
        fill={ICON_COLOR}
      />
    </Svg>
  );
}

function IconLink() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
        fill={ICON_COLOR}
      />
    </Svg>
  );
}

type ContactKind = 'email' | 'phone' | 'location' | 'linkedin' | 'github' | 'website';

function ContactIcon({ kind }: { kind: ContactKind }) {
  switch (kind) {
    case 'email':    return <IconEmail />;
    case 'phone':    return <IconPhone />;
    case 'location': return <IconLocation />;
    case 'linkedin': return <IconLinkedIn />;
    case 'github':   return <IconGitHub />;
    default:         return <IconLink />;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function meta(item: ContentItem, key: string): string {
  const m = item.metadata as Record<string, unknown> | null;
  return (m?.[key] as string) ?? '';
}

function formatDate(d: string | null | undefined): string {
  if (!d) return 'Present';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function formatDateRange(startDate: string | null | undefined, endDate: string | null | undefined): string | null {
  if (!startDate && !endDate) return null;
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

// ─── Section components ───────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

// ─── CvDocument types ─────────────────────────────────────────────────────────

interface SectionItem {
  content_id: string;
  highlights?: string[];
  order: number;
  visible?: boolean;
}

interface Section {
  type: string;
  visible: boolean;
  content?: string;
  items?: SectionItem[];
}

interface CvDocument {
  sections: Section[];
}

// ─── Template ────────────────────────────────────────────────────────────────

interface Props {
  cv: Cv;
  library: ContentItem[];
  baseUrl: string;
}

export function CvTemplate({ cv, library, baseUrl }: Props) {
  const doc = cv.cvDocument as CvDocument;
  const sections = doc?.sections ?? [];

  const byId = (id: string) => library.find(c => c.id === id);

  const metaItem = library.find(c => c.type === 'meta') ?? null;

  const fullName = metaItem ? meta(metaItem, 'full_name') || metaItem.title : cv.companyName;
  const publicUrl = `${baseUrl}/company/${cv.hash}`;

  // Build typed contact lines
  const contactLines: { kind: ContactKind; isLink: boolean; value: string; url?: string }[] = [];

  if (metaItem) {
    if (meta(metaItem, 'email'))    contactLines.push({ kind: 'email',    isLink: false, value: meta(metaItem, 'email') });
    if (meta(metaItem, 'phone'))    contactLines.push({ kind: 'phone',    isLink: false, value: meta(metaItem, 'phone') });
    if (meta(metaItem, 'location')) contactLines.push({ kind: 'location', isLink: false, value: meta(metaItem, 'location') });

    const rawLinkedin = meta(metaItem, 'linkedin');
    const rawGithub   = meta(metaItem, 'github');
    const rawWebsite  = meta(metaItem, 'website');

    if (rawLinkedin) {
      const url = rawLinkedin.startsWith('http') ? rawLinkedin : `https://${rawLinkedin}`;
      contactLines.push({ kind: 'linkedin', isLink: true, value: rawLinkedin.replace(/^https?:\/\/(www\.)?/, ''), url });
    }
    if (rawGithub) {
      const url = rawGithub.startsWith('http') ? rawGithub : `https://${rawGithub}`;
      contactLines.push({ kind: 'github', isLink: true, value: rawGithub.replace(/^https?:\/\/(www\.)?/, ''), url });
    }
    if (rawWebsite) {
      const url = rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`;
      contactLines.push({ kind: 'website', isLink: true, value: rawWebsite.replace(/^https?:\/\/(www\.)?/, ''), url });
    }
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>{fullName}</Text>
          <Text style={s.roleTitle}>{cv.roleTitle}</Text>

          {/* Two-column: contact left, web callout right */}
          <View style={s.headerColumns}>
            <View style={s.contactCol}>
              {contactLines.map((line, i) => (
                <View key={i} style={s.contactLine}>
                  <ContactIcon kind={line.kind} />
                  {line.isLink && line.url ? (
                    <Link src={line.url} style={s.contactLink}>{line.value}</Link>
                  ) : (
                    <Text style={s.contactItem}>{line.value}</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={s.webCallout}>
              <Text style={s.webCalloutHeading}>Interactive Web Version (Recommended)</Text>
              <Text style={s.webCalloutBody}>
                The web version includes clickable links, full project details, and richer formatting.
              </Text>
              <Link src={publicUrl} style={s.webCalloutUrl}>{publicUrl}</Link>
            </View>
          </View>
        </View>

        {sections
          .filter(sec => sec.visible !== false)
          .map((section, si) => {
            if (section.type === 'summary') {
              return (
                <View key={si} style={s.section}>
                  <SectionHeader title="Summary" />
                  <Text>{cv.customSummary || section.content}</Text>
                </View>
              );
            }

            if (section.type === 'experience') {
              const items = (section.items ?? [])
                .filter(i => i.visible !== false)
                .sort((a, b) => {
                  const ca = byId(a.content_id);
                  const cb = byId(b.content_id);
                  const dateA = ca?.startDate ? new Date(ca.startDate).getTime() : 0;
                  const dateB = cb?.startDate ? new Date(cb.startDate).getTime() : 0;
                  return dateB - dateA;
                });
              if (!items.length) return null;
              return (
                <View key={si} style={s.section}>
                  <SectionHeader title="Experience" />
                  {items.map((item, ii) => {
                    const c = byId(item.content_id);
                    if (!c) return null;
                    const dateRange = formatDateRange(c.startDate, c.endDate);
                    const location = meta(c, 'location');
                    const subtitleParts = [dateRange, location || null].filter(Boolean).join(' · ');
                    return (
                      <View key={ii} style={s.block} wrap={false}>
                        <Text style={s.blockTitle}>{meta(c, 'company') || c.title} — {c.title}</Text>
                        {subtitleParts ? <Text style={s.blockSubtitle}>{subtitleParts}</Text> : null}
                        {(item.highlights ?? []).map((h, hi) => <Bullet key={hi} text={h} />)}
                      </View>
                    );
                  })}
                </View>
              );
            }

            if (section.type === 'projects') {
              const items = (section.items ?? [])
                .filter(i => i.visible !== false)
                .sort((a, b) => a.order - b.order);
              if (!items.length) return null;
              return (
                <View key={si} style={s.section}>
                  <SectionHeader title="Projects" />
                  {items.map((item, ii) => {
                    const c = byId(item.content_id);
                    if (!c) return null;
                    const techStr = (c.tech as string[] | null ?? []).join(', ');
                    return (
                      <View key={ii} style={s.block} wrap={false}>
                        <Text style={s.blockTitle}>{c.title}</Text>
                        {techStr ? <Text style={s.blockTech}>{techStr}</Text> : null}
                        {(item.highlights ?? []).map((h, hi) => <Bullet key={hi} text={h} />)}
                      </View>
                    );
                  })}
                </View>
              );
            }

            if (section.type === 'skills') {
              const items = (section.items ?? [])
                .filter(i => i.visible !== false)
                .sort((a, b) => a.order - b.order);
              if (!items.length) return null;
              return (
                <View key={si} style={s.section}>
                  <SectionHeader title="Skills" />
                  <View style={s.skillsGrid}>
                    {items.map((item, ii) => {
                      const c = byId(item.content_id);
                      if (!c) return null;
                      return <Text key={ii} style={s.skillChip}>{c.title}</Text>;
                    })}
                  </View>
                </View>
              );
            }

            if (section.type === 'education') {
              const items = (section.items ?? [])
                .filter(i => i.visible !== false)
                .sort((a, b) => {
                  const ca = byId(a.content_id);
                  const cb = byId(b.content_id);
                  const dateA = ca?.startDate ? new Date(ca.startDate).getTime() : 0;
                  const dateB = cb?.startDate ? new Date(cb.startDate).getTime() : 0;
                  return dateB - dateA;
                });
              if (!items.length) return null;
              return (
                <View key={si} style={s.section}>
                  <SectionHeader title="Education" />
                  {items.map((item, ii) => {
                    const c = byId(item.content_id);
                    if (!c) return null;
                    const degree = meta(c, 'degree');
                    const field = meta(c, 'field');
                    const grade = meta(c, 'grade');
                    const institution = meta(c, 'institution');
                    const degreeTitle = [degree, field].filter(Boolean).join(' in ') || c.title;
                    const dateRange = formatDateRange(c.startDate, c.endDate);
                    return (
                      <View key={ii} style={s.block} wrap={false}>
                        <Text style={s.blockTitle}>{degreeTitle}</Text>
                        {institution ? <Text style={s.blockSubtitle}>{institution}</Text> : null}
                        {grade ? <Text style={s.blockSubtitle}>{grade}</Text> : null}
                        {dateRange ? <Text style={s.blockSubtitle}>{dateRange}</Text> : null}
                      </View>
                    );
                  })}
                </View>
              );
            }

            return null;
          })}
      </Page>
    </Document>
  );
}
