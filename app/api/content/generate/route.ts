import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createChatCompletion } from '@/lib/ai/client';

const SYSTEM_PROMPT = `You are a CV content assistant. Generate structured content item data based on the user's description.
Only generate descriptive and factual content. Do not invent, embellish, or add any experience, skills, or achievements not mentioned in the user's description.
Return a single JSON object matching the requested type's schema — no markdown, no explanation, just JSON.`;

const TYPE_SCHEMAS: Record<string, string> = {
  project: `{
  "title": string,
  "slug": string (lowercase-hyphenated),
  "summary": string (1-2 sentences for CV use),
  "description": string (2-4 sentences for project page),
  "tech": string[] (tech stack),
  "tags": string[],
  "url": string | null,
  "repoUrl": string | null,
  "metadata": { "role": string, "highlights": string[] (3-5 bullets) }
}`,
  experience: `{
  "title": string (job title),
  "summary": string (1-2 sentences),
  "description": string (2-4 sentences),
  "tech": string[],
  "tags": string[],
  "metadata": { "company": string, "location": string, "employment_type": "full-time"|"part-time"|"freelance"|"internship", "highlights": string[] (3-5 bullets) }
}`,
  education: `{
  "title": string (degree + field),
  "summary": string (1 sentence),
  "metadata": { "institution": string, "degree": string, "field": string, "grade": string | null }
}`,
  skill: `{
  "title": string (skill name),
  "summary": string (1 sentence about proficiency/use),
  "metadata": { "category": "language"|"framework"|"tool"|"soft"|"other", "proficiency": "beginner"|"intermediate"|"advanced"|"expert" }
}`,
  meta: `{
  "title": string (full name),
  "summary": string (bio_short — 1 sentence),
  "description": string (bio_long — 2-3 sentences),
  "metadata": { "full_name": string, "email": string, "phone": string|null, "location": string, "linkedin": string|null, "github": string|null, "website": string|null, "bio_short": string, "bio_long": string }
}`,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, description } = await req.json();
  if (!type || !description) {
    return NextResponse.json({ error: 'type and description are required' }, { status: 400 });
  }

  const schema = TYPE_SCHEMAS[type as string];
  if (!schema) {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  }

  const completion = await createChatCompletion({
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate a "${type}" content item for this description:\n\n${description}\n\nReturn JSON matching this shape:\n${schema}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 502 });
  }

  return NextResponse.json({ type, ...parsed as object });
}
