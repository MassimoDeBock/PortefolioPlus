import {
  pgTable,
  pgEnum,
  uuid,
  text,
  date,
  jsonb,
  timestamp,
  integer,
  unique,
} from 'drizzle-orm/pg-core';

export const contentTypeEnum = pgEnum('content_type', [
  'project',
  'experience',
  'education',
  'skill',
  'meta',
]);

export const contentItems = pgTable('content_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: contentTypeEnum('type').notNull(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  summary: text('summary'),
  description: text('description'),
  tech: text('tech').array().default([]),
  tags: text('tags').array().default([]),
  startDate: date('start_date'),
  endDate: date('end_date'),
  url: text('url'),
  repoUrl: text('repo_url'),
  images: text('images').array().default([]),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cvs = pgTable(
  'cvs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    hash: text('hash').notNull(),
    companyName: text('company_name').notNull(),
    roleTitle: text('role_title').notNull(),
    jobPostRaw: text('job_post_raw'),
    cvDocument: jsonb('cv_document').default({}),
    webpageConfig: jsonb('webpage_config').default({}),
    customSummary: text('custom_summary'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
    viewCount: integer('view_count').default(0).notNull(),
  },
  (table) => [unique().on(table.hash)],
);

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Cv = typeof cvs.$inferSelect;
export type NewCv = typeof cvs.$inferInsert;
