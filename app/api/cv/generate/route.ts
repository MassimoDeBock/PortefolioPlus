import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { contentItems, cvs } from '@/lib/db/schema';
import { createChatCompletion } from '@/lib/ai/client';

const SYSTEM_PROMPT = `You are a CV tailoring assistant.
Your job is to fill the fixed CV structure below with content from the provided library, tailored to the job posting.

CRITICAL RULES:
- Only reference content items from the provided library using their exact IDs.
- Do not invent, embellish, or add any experience, skills, or achievements not present in the library.
- You may rephrase bullet highlights to match the job's language, but must stay factually accurate to the source.
- Always include ALL experience items — never omit any.
- Always include ALL education items.
- For projects and skills, select the most relevant items from the library.
- Never mention employment type (no "internship", "part-time", "full-time", "freelance", or similar labels) anywhere.
- The summary MUST be written in first person ("I am…", "I have…", "My experience…"). Never use the candidate's name or third-person pronouns (he/she/they). The candidate profile below may be written in third person — ignore that style and always convert to first person.
- Return only valid JSON — no markdown, no explanation.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { hash, companyName, roleTitle, jobPost } = await req.json();
  if (!hash || !companyName || !roleTitle || !jobPost) {
    return NextResponse.json({ error: 'hash, companyName, roleTitle, jobPost are required' }, { status: 400 });
  }

  // Fetch the full content library, strip meta items before sending to LLM
  const library = await db.select().from(contentItems);
  const metaItem = library.find((item) => item.type === 'meta') ?? null;
  const libraryForLLM = library.filter((item) => item.type !== 'meta');

  // Build a safe candidate profile from meta (no PII — no email/phone/location)
  const metaMeta = (metaItem?.metadata ?? {}) as Record<string, unknown>;
  const candidateProfile = [
    metaMeta.full_name ? `Name: ${metaMeta.full_name}` : null,
    metaMeta.bio_short ? `Bio: ${metaMeta.bio_short}` : null,
    metaMeta.bio_long ? `About: ${metaMeta.bio_long}` : null,
    metaMeta.ai_context ? `Background: ${metaMeta.ai_context}` : null,
    metaMeta.github ? `GitHub: ${metaMeta.github}` : null,
    metaMeta.linkedin ? `LinkedIn: ${metaMeta.linkedin}` : null,
  ].filter(Boolean).join('\n');

  const prompt = `Candidate profile:
${candidateProfile || '(no profile provided)'}

Job posting for ${roleTitle} at ${companyName}:
---
${jobPost}
---

Content library (JSON):
${JSON.stringify(libraryForLLM, null, 2)}

Return a JSON object with exactly this shape — all six sections must always be present.
IMPORTANT: custom_summary and the summary section content must be written in first person ("I am…", "I have…"). Do NOT use the candidate's name or any third-person phrasing.
{
  "custom_summary": "3-5 sentence tailored summary for this role, written in first person",
  "cv_document": {
    "sections": [
      {
        "type": "summary",
        "visible": true,
        "content": "same as custom_summary"
      },
      {
        "type": "experience",
        "visible": true,
        "items": [
          { "content_id": "<uuid>", "highlights": ["rephrased bullet 1", "rephrased bullet 2"], "order": 1 }
        ]
      },
      {
        "type": "projects",
        "visible": true,
        "items": [
          { "content_id": "<uuid>", "highlights": ["rephrased bullet 1"], "order": 1 }
        ]
      },
      {
        "type": "skills",
        "visible": true,
        "items": [
          { "content_id": "<uuid>", "order": 1 }
        ]
      },
      {
        "type": "education",
        "visible": true,
        "items": [
          { "content_id": "<uuid>", "order": 1 }
        ]
      }
    ]
  }
}

Rules:
- Include every experience item and every education item from the library.
- For projects, include the most relevant ones to this job posting.
- For skills, order by relevance to this job posting.
- Only use content_ids that exist in the provided library.`;

  const completion = await createChatCompletion({
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  let parsed: { custom_summary: string; cv_document: { sections: unknown[] } };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 502 });
  }

  // Prepend the header section using local meta — never sent to the LLM
  if (metaItem) {
    const sections: unknown[] = parsed.cv_document?.sections ?? [];
    sections.unshift({ type: 'header', visible: true, content_id: metaItem.id });
    parsed.cv_document = { ...parsed.cv_document, sections };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const [cv] = await db
    .insert(cvs)
    .values({
      hash,
      companyName,
      roleTitle,
      jobPostRaw: jobPost,
      customSummary: parsed.custom_summary ?? '',
      cvDocument: parsed.cv_document ?? {},
      webpageConfig: {},
    })
    .returning();

  return NextResponse.json({ hash: cv.hash, baseUrl });
}
