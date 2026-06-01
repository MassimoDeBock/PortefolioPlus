export type ContentType = 'project' | 'experience' | 'education' | 'skill' | 'meta';

export interface ContentFormValues {
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  description: string;
  tech: string;        // comma-separated
  tags: string;        // comma-separated
  startDate: string;
  endDate: string;
  url: string;
  repoUrl: string;
  // metadata fields — flattened for the form
  meta_role: string;
  meta_highlights: string;    // newline-separated
  meta_company: string;
  meta_location: string;
  meta_employment_type: string;
  meta_institution: string;
  meta_degree: string;
  meta_field: string;
  meta_grade: string;
  meta_category: string;
  meta_proficiency: string;
  meta_full_name: string;
  meta_email: string;
  meta_phone: string;
  meta_linkedin: string;
  meta_github: string;
  meta_website: string;
  meta_bio_short: string;
  meta_bio_long: string;
  meta_ai_context: string;
}

export const EMPTY_FORM_VALUES: ContentFormValues = {
  type: 'project',
  title: '', slug: '', summary: '', description: '',
  tech: '', tags: '', startDate: '', endDate: '', url: '', repoUrl: '',
  meta_role: '', meta_highlights: '',
  meta_company: '', meta_location: '', meta_employment_type: 'full-time',
  meta_institution: '', meta_degree: '', meta_field: '', meta_grade: '',
  meta_category: 'other', meta_proficiency: 'intermediate',
  meta_full_name: '', meta_email: '', meta_phone: '', meta_linkedin: '',
  meta_github: '', meta_website: '', meta_bio_short: '', meta_bio_long: '',
  meta_ai_context: '',
};

export function formValuesToApiBody(v: ContentFormValues) {
  const highlights = v.meta_highlights
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const metadataMap: Record<ContentType, object> = {
    project: {
      role: v.meta_role,
      highlights,
    },
    experience: {
      company: v.meta_company,
      location: v.meta_location,
      employment_type: v.meta_employment_type,
      highlights,
    },
    education: {
      institution: v.meta_institution,
      degree: v.meta_degree,
      field: v.meta_field,
      grade: v.meta_grade || null,
    },
    skill: {
      category: v.meta_category,
      proficiency: v.meta_proficiency,
    },
    meta: {
      full_name: v.meta_full_name,
      email: v.meta_email,
      phone: v.meta_phone || null,
      location: v.meta_location,
      linkedin: v.meta_linkedin || null,
      github: v.meta_github || null,
      website: v.meta_website || null,
      bio_short: v.meta_bio_short,
      bio_long: v.meta_bio_long,
      ai_context: v.meta_ai_context || null,
    },
  };

  return {
    type: v.type,
    title: v.title,
    slug: v.slug || null,
    summary: v.summary || null,
    description: v.description || null,
    tech: v.tech ? v.tech.split(',').map(s => s.trim()).filter(Boolean) : [],
    tags: v.tags ? v.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    startDate: v.startDate || null,
    endDate: v.endDate || null,
    url: v.url || null,
    repoUrl: v.repoUrl || null,
    metadata: metadataMap[v.type],
  };
}

export function apiItemToFormValues(item: Record<string, unknown>): ContentFormValues {
  const m = (item.metadata ?? {}) as Record<string, unknown>;
  const highlights = Array.isArray(m.highlights) ? (m.highlights as string[]).join('\n') : '';

  return {
    type: item.type as ContentType,
    title: (item.title as string) ?? '',
    slug: (item.slug as string) ?? '',
    summary: (item.summary as string) ?? '',
    description: (item.description as string) ?? '',
    tech: Array.isArray(item.tech) ? (item.tech as string[]).join(', ') : '',
    tags: Array.isArray(item.tags) ? (item.tags as string[]).join(', ') : '',
    startDate: (item.startDate as string) ?? '',
    endDate: (item.endDate as string) ?? '',
    url: (item.url as string) ?? '',
    repoUrl: (item.repoUrl as string) ?? '',
    meta_role: (m.role as string) ?? '',
    meta_highlights: highlights,
    meta_company: (m.company as string) ?? '',
    meta_location: (m.location as string) ?? '',
    meta_employment_type: (m.employment_type as string) ?? 'full-time',
    meta_institution: (m.institution as string) ?? '',
    meta_degree: (m.degree as string) ?? '',
    meta_field: (m.field as string) ?? '',
    meta_grade: (m.grade as string) ?? '',
    meta_category: (m.category as string) ?? 'other',
    meta_proficiency: (m.proficiency as string) ?? 'intermediate',
    meta_full_name: (m.full_name as string) ?? '',
    meta_email: (m.email as string) ?? '',
    meta_phone: (m.phone as string) ?? '',
    meta_linkedin: (m.linkedin as string) ?? '',
    meta_github: (m.github as string) ?? '',
    meta_website: (m.website as string) ?? '',
    meta_bio_short: (m.bio_short as string) ?? '',
    meta_bio_long: (m.bio_long as string) ?? '',
    meta_ai_context: (m.ai_context as string) ?? '',
  };
}
