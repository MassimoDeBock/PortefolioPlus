# PortefolioPlus

Personal portfolio site and tailored CV generator. Built with Next.js 14, Neon Postgres, NextAuth v5, and AI-assisted content via OpenRouter.

## What it does

**Public site**
- `/` — portfolio homepage with projects carousel, experience, skills, and education
- `/projects/[slug]` — individual project showcase page
- `/company/[hash]` — tailored CV landing page per company, with PDF download

**Admin site** (protected at `/admin`)
- Content library — manage projects, experience, education, skills, and personal info
- CV generator — paste a job description → AI tailors your content → edit in-browser → export PDF
- CV list — all generated CVs with public URLs and view counts

## Stack

| | |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Database | Neon (Postgres, serverless) |
| ORM | Drizzle |
| Auth | NextAuth v5 (credentials, JWT) |
| AI | OpenRouter — free model fallback chain (OpenAI-compat SDK) |
| PDF | @react-pdf/renderer |
| Styling | Tailwind CSS v3 |
| Hosting | Vercel |

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

```
DATABASE_URL=           # Neon connection string
NEXTAUTH_SECRET=        # openssl rand -base64 32
ADMIN_EMAIL=            # your login email
ADMIN_PASSWORD_HASH=    # bcrypt hash — see below
DEEPSEEK_API_KEY=       # OpenRouter API key
DEEPSEEK_BASE_URL=https://openrouter.ai/api/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Generate your password hash:
```bash
npx tsx scripts/hash-password.ts yourpassword
```

> **Important:** The bcrypt hash contains `$` characters. In `.env.local`, escape each one as `\$`.
> Example: `ADMIN_PASSWORD_HASH=\$2b\$10\$abc...`

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000/admin` and log in.

---

## Content workflow

### Adding content

Go to `/admin/content/new`. Three options:

1. **Manual** — fill in the form fields directly
2. **AI-assisted** — describe in plain text → AI generates a prefilled form → review and save
3. **JSON import** — paste a JSON object → preview → save

Content types: `project`, `experience`, `education`, `skill`, `meta` (personal info)

**Start with a `meta` item** — it provides your name, email, location, and contact links to the homepage and PDF header.

### Generating a CV

1. Go to `/admin/cv/new`
2. Enter company name, role title, and paste the full job description
3. Click **Generate CV** — AI selects relevant content items and tailors the bullets
4. Edit sections in the structured editor — toggle visibility, reorder, edit highlights inline
5. Click **Export PDF** to download
6. Share `/company/[hash]` — the public landing page with your tailored CV

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Settings → Environment Variables**, add all variables from `.env.example` **except** `BLOB_READ_WRITE_TOKEN` (see step 6)
   - Set `NEXT_PUBLIC_BASE_URL` to your production URL (e.g. `https://your-project.vercel.app`)
   - Remember to escape `$` as `\$` in `ADMIN_PASSWORD_HASH`
4. Deploy — Vercel auto-detects Next.js, no build config needed
5. After first deploy, run `npm run db:push` once against your production Neon DB to initialise the schema
6. **Image uploads (optional):** Go to Vercel dashboard → **Storage** → **Create Blob Store**, then copy the generated `BLOB_READ_WRITE_TOKEN` into your project's environment variables and redeploy

> **Note:** `@react-pdf/renderer` runs server-side only and is listed under `serverComponentsExternalPackages` in `next.config.mjs`. No Puppeteer or headless browser is needed — works on Vercel's free tier.

---

## Project structure

```
app/
  (public)/
    page.tsx                    homepage — name, bio, projects carousel, experience, skills, education
    projects/[slug]/page.tsx    individual project showcase
    company/[hash]/page.tsx     tailored CV landing page
  admin/
    page.tsx                    dashboard
    content/                    content library CRUD
    cv/                         CV generator, editor, list
  api/
    content/                    GET/POST/PUT/DELETE content items + AI generation
    cv/                         GET/PUT CV + AI generation + PDF export
    upload/                     image upload (stub — wire up Vercel Blob)

lib/
  db/schema.ts                  Drizzle schema (content_items + cvs tables)
  db/index.ts                   Neon serverless client
  auth.ts                       NextAuth full config (bcrypt, credentials)
  auth.config.ts                Edge-safe config (used by middleware only)
  ai/client.ts                  OpenRouter client with free-model fallback chain
  pdf/template.tsx              react-pdf A4 CV template

components/
  content/ContentForm.tsx       content item form (manual + AI + JSON)
  cv/CvEditor.tsx               CV section editor
  public/
    ColorWheel.tsx              theme switcher (8 themes, drag-to-select)
    FilmStrip.tsx               infinite project carousel
    TechTags.tsx                parallelogram tech tag row
    ExpandableDescription.tsx   collapsible text with URL linkification

middleware.ts                   JWT guard for /admin/*
scripts/
  hash-password.ts              generate ADMIN_PASSWORD_HASH
```

## Database scripts

```bash
npm run db:push       # push schema changes to database (dev / first deploy)
npm run db:generate   # generate migration files
npm run db:migrate    # run pending migrations
npm run db:studio     # open Drizzle Studio (browser GUI for your data)
```

---

## Roadmap / contribution ideas

| Feature | Effort | Notes |
|---|---|---|
| Image upload | Low | `/api/upload` stub exists; wire up Vercel Blob |
| CV expiry date UI | Low | `expires_at` column in DB; needs a date picker in admin |
| Job description PDF upload | Low | Currently text-paste only; add a file input to `/admin/cv/new` |
| PDF preview before export | Medium | Render react-pdf in an iframe inside the CV editor |
| LinkedIn / résumé import | Medium | Parse PDF/text to pre-fill the content library |
| Per-CV analytics | Medium | Track referrer, device, geo per view (already have `view_count`) |
| Multiple admin users | Medium | Schema + invite flow change |
