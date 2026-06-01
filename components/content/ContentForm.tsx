'use client';

import { useState, useEffect } from 'react';
import {
  type ContentType,
  type ContentFormValues,
  EMPTY_FORM_VALUES,
} from './ContentForm.utils';

export type { ContentFormValues };
export { formValuesToApiBody, apiItemToFormValues } from './ContentForm.utils';

const EMPTY = EMPTY_FORM_VALUES;

interface Props {
  initialValues?: Partial<ContentFormValues>;
  onSubmit: (data: ContentFormValues) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ContentForm({ initialValues, onSubmit, isLoading, submitLabel = 'Save' }: Props) {
  const [values, setValues] = useState<ContentFormValues>({ ...EMPTY, ...initialValues });
  const [slugManual, setSlugManual] = useState(!!initialValues?.slug);

  useEffect(() => {
    if (!slugManual && values.type !== 'meta' && values.type !== 'skill') {
      setValues(v => ({ ...v, slug: slugify(v.title) }));
    }
  }, [values.title, values.type, slugManual]);

  function set(field: keyof ContentFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues(v => ({ ...v, [field]: e.target.value }));
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  const inputCls = 'w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black';
  const labelCls = 'block text-sm font-medium mb-1';
  const fieldCls = 'mb-4';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type */}
      <div className={fieldCls}>
        <label className={labelCls}>Type *</label>
        <select value={values.type} onChange={set('type')} className={inputCls}>
          {(['project', 'experience', 'education', 'skill', 'meta'] as ContentType[]).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Common fields */}
      <div className={fieldCls}>
        <label className={labelCls}>Title *</label>
        <input required value={values.title} onChange={set('title')} className={inputCls} />
      </div>

      {values.type !== 'meta' && values.type !== 'skill' && (
        <div className={fieldCls}>
          <label className={labelCls}>Slug</label>
          <input
            value={values.slug}
            onChange={e => { setSlugManual(true); set('slug')(e); }}
            className={inputCls}
            placeholder="auto-generated from title"
          />
        </div>
      )}

      <div className={fieldCls}>
        <label className={labelCls}>Summary</label>
        <textarea rows={2} value={values.summary} onChange={set('summary')} className={inputCls} />
      </div>

      {values.type !== 'skill' && values.type !== 'education' && (
        <div className={fieldCls}>
          <label className={labelCls}>Description</label>
          <textarea rows={4} value={values.description} onChange={set('description')} className={inputCls} />
        </div>
      )}

      {(values.type === 'project' || values.type === 'experience') && (
        <>
          <div className={fieldCls}>
            <label className={labelCls}>Tech (comma-separated)</label>
            <input value={values.tech} onChange={set('tech')} className={inputCls} placeholder="React, TypeScript, …" />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input value={values.tags} onChange={set('tags')} className={inputCls} placeholder="frontend, fullstack, …" />
          </div>
        </>
      )}

      {values.type !== 'skill' && values.type !== 'meta' && (
        <div className="grid grid-cols-2 gap-4">
          <div className={fieldCls}>
            <label className={labelCls}>Start date</label>
            <input type="date" value={values.startDate} onChange={set('startDate')} className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>End date (blank = present)</label>
            <input type="date" value={values.endDate} onChange={set('endDate')} className={inputCls} />
          </div>
        </div>
      )}

      {values.type === 'project' && (
        <div className="grid grid-cols-2 gap-4">
          <div className={fieldCls}>
            <label className={labelCls}>Live URL</label>
            <input type="url" value={values.url} onChange={set('url')} className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Repo URL</label>
            <input type="url" value={values.repoUrl} onChange={set('repoUrl')} className={inputCls} />
          </div>
        </div>
      )}

      {values.type === 'experience' && (
        <div className={fieldCls}>
          <label className={labelCls}>Company URL</label>
          <input type="url" value={values.url} onChange={set('url')} className={inputCls} placeholder="https://company.com" />
        </div>
      )}

      {/* Type-specific metadata */}
      {values.type === 'project' && (
        <section className="border-t pt-4">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Project metadata</p>
          <div className={fieldCls}>
            <label className={labelCls}>Role</label>
            <input value={values.meta_role} onChange={set('meta_role')} className={inputCls} placeholder="Lead Developer" />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Highlights (one per line)</label>
            <textarea rows={4} value={values.meta_highlights} onChange={set('meta_highlights')} className={inputCls} placeholder="Built X with Y&#10;Reduced latency by Z%" />
          </div>
        </section>
      )}

      {values.type === 'experience' && (
        <section className="border-t pt-4">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Experience metadata</p>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Company</label>
              <input value={values.meta_company} onChange={set('meta_company')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Location</label>
              <input value={values.meta_location} onChange={set('meta_location')} className={inputCls} />
            </div>
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Employment type</label>
            <select value={values.meta_employment_type} onChange={set('meta_employment_type')} className={inputCls}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Highlights (one per line)</label>
            <textarea rows={4} value={values.meta_highlights} onChange={set('meta_highlights')} className={inputCls} />
          </div>
        </section>
      )}

      {values.type === 'education' && (
        <section className="border-t pt-4">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Education metadata</p>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Institution</label>
              <input value={values.meta_institution} onChange={set('meta_institution')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Grade</label>
              <input value={values.meta_grade} onChange={set('meta_grade')} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Degree</label>
              <input value={values.meta_degree} onChange={set('meta_degree')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Field of study</label>
              <input value={values.meta_field} onChange={set('meta_field')} className={inputCls} />
            </div>
          </div>
        </section>
      )}

      {values.type === 'skill' && (
        <section className="border-t pt-4">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Skill metadata</p>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Category</label>
              <select value={values.meta_category} onChange={set('meta_category')} className={inputCls}>
                <option value="language">Language</option>
                <option value="framework">Framework</option>
                <option value="tool">Tool</option>
                <option value="soft">Soft skill</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Proficiency</label>
              <select value={values.meta_proficiency} onChange={set('meta_proficiency')} className={inputCls}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {values.type === 'meta' && (
        <section className="border-t pt-4">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Personal info</p>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Full name</label>
              <input value={values.meta_full_name} onChange={set('meta_full_name')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Email</label>
              <input type="email" value={values.meta_email} onChange={set('meta_email')} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Phone</label>
              <input value={values.meta_phone} onChange={set('meta_phone')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Location</label>
              <input value={values.meta_location} onChange={set('meta_location')} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>LinkedIn URL</label>
              <input type="url" value={values.meta_linkedin} onChange={set('meta_linkedin')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>GitHub URL</label>
              <input type="url" value={values.meta_github} onChange={set('meta_github')} className={inputCls} />
            </div>
            <div className={fieldCls}>
              <label className={labelCls}>Website URL</label>
              <input type="url" value={values.meta_website} onChange={set('meta_website')} className={inputCls} />
            </div>
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Bio short (1 sentence)</label>
            <input value={values.meta_bio_short} onChange={set('meta_bio_short')} className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Bio long (2-3 sentences)</label>
            <textarea rows={3} value={values.meta_bio_long} onChange={set('meta_bio_long')} className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>AI context</label>
            <p className="text-xs text-gray-400 mb-1">
              Freeform background about you — career goals, strengths, what makes you unique. Sent to the AI on every CV generation to shape the summary. Never shown publicly.
            </p>
            <textarea rows={6} value={values.meta_ai_context} onChange={set('meta_ai_context')} className={inputCls} placeholder="e.g. I'm a self-taught developer transitioning from a design background. I care deeply about user experience and tend to gravitate toward frontend and product work. I'm looking for roles where I can grow into a more senior position…" />
          </div>
        </section>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

