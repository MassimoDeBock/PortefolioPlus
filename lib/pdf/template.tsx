import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Svg, Path } from '@react-pdf/renderer';
import type { Cv, ContentItem } from '@/lib/db/schema';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  ink:       '#111827',
  muted:     '#6b7280',
  subtle:    '#9ca3af',
  accent:    '#1d4ed8',
  rule:      '#d1d5db',
  chipBg:    '#f3f4f6',
  chipBorder:'#e5e7eb',
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: C.ink,
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 52,
    lineHeight: 1.45,
  },

  // ── Header
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  roleTitle: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    marginBottom: 10,
  },
  headerColumns: { flexDirection: 'row', gap: 14, marginBottom: 2 },
  contactCol: { flex: 1 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  contactText: { fontSize: 8.5, color: C.muted },
  contactLink: { fontSize: 8.5, color: C.accent },

  // ── Web callout
  webCallout: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 0.75,
    borderColor: '#bfdbfe',
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  webCalloutHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: C.accent,
    marginBottom: 2,
  },
  webCalloutBody: { fontSize: 7.5, color: '#374151', marginBottom: 3, lineHeight: 1.4 },
  webCalloutUrl:  { fontSize: 8, color: C.accent, fontFamily: 'Helvetica-Bold' },

  // ── Section
  section: { marginTop: 13 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: C.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: C.ink,
    paddingBottom: 3,
    marginBottom: 8,
  },

  // ── Experience block
  block: { marginBottom: 9 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  expDate:   { fontSize: 8.5, color: C.muted, textAlign: 'right' },
  expSub:    { fontSize: 8.5, color: C.muted, marginBottom: 3 },

  // ── Project block
  projHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
  projTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  projLinks:  { flexDirection: 'row', gap: 8 },
  projLink:   { fontSize: 8, color: C.accent },
  projTech:   { fontSize: 8, color: C.muted, marginBottom: 2, fontStyle: 'italic' },
  projDesc:   { fontSize: 8.5, color: C.muted, marginBottom: 3, lineHeight: 1.4 },

  // ── Bullet
  bullet:    { flexDirection: 'row', marginTop: 2 },
  bulletDot: { width: 10, color: C.muted, fontSize: 9 },
  bulletText:{ flex: 1, fontSize: 9 },

  // ── Skills
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skillChip: {
    backgroundColor: C.chipBg,
    borderWidth: 0.5,
    borderColor: C.chipBorder,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 8.5,
    color: C.ink,
  },

  // ── Education
  eduHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eduTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  eduSub:    { fontSize: 8.5, color: C.muted },
  eduDate:   { fontSize: 8.5, color: C.muted, textAlign: 'right' },
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const SZ = 8.5;
const IC = C.muted;

function IconEmail()    { return <Svg width={SZ} height={SZ} viewBox="0 0 24 24"><Path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill={IC}/></Svg>; }
function IconPhone()    { return <Svg width={SZ} height={SZ} viewBox="0 0 24 24"><Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill={IC}/></Svg>; }
function IconLocation() { return <Svg width={SZ} height={SZ} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={IC}/></Svg>; }
function IconLinkedIn() { return <Svg width={SZ} height={SZ} viewBox="0 0 24 24"><Path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-5 6h-2v8h2v-4.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V17h2v-4.5C21 10.01 19.49 9 17.5 9c-1.06 0-1.96.5-2.5 1.32V9zm-5 0H7v8h2V9zM8 7.5A1.5 1.5 0 0 0 8 4.5 1.5 1.5 0 0 0 8 7.5z" fill={IC}/></Svg>; }
function IconGitHub()   { return <Svg width={SZ} height={SZ} viewBox="0 0 24 24"><Path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill={IC}/></Svg>; }
function IconLink()     { return <Svg width={SZ} height={SZ} viewBox="0 0 24 24"><Path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill={IC}/></Svg>; }

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

function mf(item: ContentItem, key: string): string {
  return ((item.metadata as Record<string, unknown> | null)?.[key] as string) ?? '';
}

function fmt(d: string | null | undefined): string {
  if (!d) return 'Present';
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function dateRange(start: string | null | undefined, end: string | null | undefined): string | null {
  if (!start && !end) return null;
  return `${fmt(start)} – ${fmt(end)}`;
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionItem { content_id: string; highlights?: string[]; order: number; visible?: boolean; }
interface Section     { type: string; visible: boolean; content?: string; items?: SectionItem[]; }
interface CvDocument  { sections: Section[]; }

// ─── Template ────────────────────────────────────────────────────────────────

export function CvTemplate({ cv, library, baseUrl }: { cv: Cv; library: ContentItem[]; baseUrl: string }) {
  const doc      = cv.cvDocument as CvDocument;
  const sections = doc?.sections ?? [];
  const byId     = (id: string) => library.find(c => c.id === id);
  const metaItem = library.find(c => c.type === 'meta') ?? null;
  const fullName = metaItem ? mf(metaItem, 'full_name') || metaItem.title : cv.companyName;
  const publicUrl = `${baseUrl}/company/${cv.hash}`;

  const contactLines: { kind: ContactKind; isLink: boolean; value: string; url?: string }[] = [];
  if (metaItem) {
    const add = (kind: ContactKind, val: string, link = false) => {
      if (!val) return;
      const url = link ? (val.startsWith('http') ? val : `https://${val}`) : undefined;
      contactLines.push({ kind, isLink: link, value: val.replace(/^https?:\/\/(www\.)?/, ''), url });
    };
    add('email',    mf(metaItem, 'email'));
    add('phone',    mf(metaItem, 'phone'));
    add('location', mf(metaItem, 'location'));
    add('linkedin', mf(metaItem, 'linkedin'), true);
    add('github',   mf(metaItem, 'github'),   true);
    add('website',  mf(metaItem, 'website'),  true);
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <Text style={s.name}>{fullName}</Text>
        <Text style={s.roleTitle}>{cv.roleTitle}</Text>
        <View style={s.divider} />

        <View style={s.headerColumns}>
          <View style={s.contactCol}>
            {contactLines.map((line, i) => (
              <View key={i} style={s.contactLine}>
                <ContactIcon kind={line.kind} />
                {line.isLink && line.url
                  ? <Link src={line.url} style={s.contactLink}>{line.value}</Link>
                  : <Text style={s.contactText}>{line.value}</Text>}
              </View>
            ))}
          </View>
          <View style={s.webCallout}>
            <Text style={s.webCalloutHeading}>Interactive Web Version</Text>
            <Text style={s.webCalloutBody}>
              The web version includes clickable links, full project details, and richer formatting.
            </Text>
            <Link src={publicUrl} style={s.webCalloutUrl}>{publicUrl}</Link>
          </View>
        </View>

        {/* ── Sections ── */}
        {sections.filter(sec => sec.visible !== false).map((section, si) => {

          // Summary
          if (section.type === 'summary') {
            const text = cv.customSummary || section.content;
            if (!text) return null;
            return (
              <View key={si} style={s.section}>
                <Text style={s.sectionTitle}>Summary</Text>
                <Text style={{ fontSize: 9.5, lineHeight: 1.5 }}>{text}</Text>
              </View>
            );
          }

          // Experience
          if (section.type === 'experience') {
            const items = (section.items ?? [])
              .filter(i => i.visible !== false)
              .sort((a, b) => {
                const da = byId(a.content_id)?.startDate;
                const db = byId(b.content_id)?.startDate;
                return (db ? new Date(db).getTime() : 0) - (da ? new Date(da).getTime() : 0);
              });
            if (!items.length) return null;
            return (
              <View key={si} style={s.section}>
                <Text style={s.sectionTitle}>Experience</Text>
                {items.map((item, ii) => {
                  const c = byId(item.content_id);
                  if (!c) return null;
                  const dr = dateRange(c.startDate, c.endDate);
                  const company = mf(c, 'company');
                  const location = mf(c, 'location');
                  const sub = [company && location ? `${company} · ${location}` : company || location, dr].filter(Boolean);
                  return (
                    <View key={ii} style={s.block} wrap={false}>
                      <View style={s.expHeader}>
                        <Text style={s.expTitle}>{c.title}</Text>
                        {dr ? <Text style={s.expDate}>{dr}</Text> : null}
                      </View>
                      {sub.map((t, ti) => <Text key={ti} style={s.expSub}>{t}</Text>)}
                      {(item.highlights ?? []).map((h, hi) => <Bullet key={hi} text={h} />)}
                    </View>
                  );
                })}
              </View>
            );
          }

          // Projects
          if (section.type === 'projects') {
            const items = (section.items ?? [])
              .filter(i => i.visible !== false)
              .sort((a, b) => a.order - b.order);
            if (!items.length) return null;
            return (
              <View key={si} style={s.section}>
                <Text style={s.sectionTitle}>Projects</Text>
                {items.map((item, ii) => {
                  const c = byId(item.content_id);
                  if (!c) return null;
                  // Cap tech at 4 to avoid clutter
                  const tech = (c.tech as string[] | null ?? []).slice(0, 4).join(' · ');
                  const desc = c.summary ?? '';
                  const hasLinks = c.url || c.repoUrl;
                  return (
                    <View key={ii} style={s.block} wrap={false}>
                      <View style={s.projHeader}>
                        <Text style={s.projTitle}>{c.title}</Text>
                        {hasLinks && (
                          <View style={s.projLinks}>
                            {c.url    && <Link src={c.url}    style={s.projLink}>live ↗</Link>}
                            {c.repoUrl && <Link src={c.repoUrl} style={s.projLink}>source ↗</Link>}
                          </View>
                        )}
                      </View>
                      {tech ? <Text style={s.projTech}>{tech}</Text> : null}
                      {desc ? <Text style={s.projDesc}>{desc}</Text> : null}
                      {(item.highlights ?? []).map((h, hi) => <Bullet key={hi} text={h} />)}
                    </View>
                  );
                })}
              </View>
            );
          }

          // Skills
          if (section.type === 'skills') {
            const items = (section.items ?? [])
              .filter(i => i.visible !== false)
              .sort((a, b) => a.order - b.order);
            if (!items.length) return null;
            return (
              <View key={si} style={s.section}>
                <Text style={s.sectionTitle}>Skills</Text>
                <View style={s.skillsWrap}>
                  {items.map((item, ii) => {
                    const c = byId(item.content_id);
                    if (!c) return null;
                    return <Text key={ii} style={s.skillChip}>{c.title}</Text>;
                  })}
                </View>
              </View>
            );
          }

          // Education
          if (section.type === 'education') {
            const items = (section.items ?? [])
              .filter(i => i.visible !== false)
              .sort((a, b) => {
                const da = byId(a.content_id)?.startDate;
                const db = byId(b.content_id)?.startDate;
                return (db ? new Date(db).getTime() : 0) - (da ? new Date(da).getTime() : 0);
              });
            if (!items.length) return null;
            return (
              <View key={si} style={s.section}>
                <Text style={s.sectionTitle}>Education</Text>
                {items.map((item, ii) => {
                  const c = byId(item.content_id);
                  if (!c) return null;
                  const degree = [mf(c, 'degree'), mf(c, 'field')].filter(Boolean).join(' in ') || c.title;
                  const institution = mf(c, 'institution');
                  const dr = dateRange(c.startDate, c.endDate);
                  const grade = mf(c, 'grade');
                  return (
                    <View key={ii} style={s.block} wrap={false}>
                      <View style={s.eduHeader}>
                        <Text style={s.eduTitle}>{degree}</Text>
                        {dr ? <Text style={s.eduDate}>{dr}</Text> : null}
                      </View>
                      {institution ? <Text style={s.eduSub}>{institution}</Text> : null}
                      {grade       ? <Text style={s.eduSub}>{grade}</Text>       : null}
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
