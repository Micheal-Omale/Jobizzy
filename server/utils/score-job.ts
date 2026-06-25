import { Type } from '@google/genai'
import type { Schema } from '@google/genai'
import type { AdzunaJob, Profile, ScoredJob } from '../../types'
import { generateWithRetry, getGemini, parseJsonLoose } from './gemini'

const MODEL = 'gemini-2.5-flash'
// 2.5-flash is a THINKING model — reasoning tokens count against maxOutputTokens.
// Scoring is a constrained classification task that doesn't need chain-of-thought,
// so we disable thinking (thinkingBudget: 0) and give the JSON comfortable room.
// At 300 the thinking budget truncated the JSON → "Model returned invalid JSON".
const MAX_OUTPUT_TOKENS = 1024

const SYSTEM_PROMPT = `You are a precise job-matching assistant. Given a candidate's profile and a single job posting, score how well the candidate fits the role.
Judge fit from the candidate's skills, seniority, years of experience, current title, and work history against what the posting asks for.
- matchScore: integer 0-100. 90+ = excellent fit, 80-89 = strong, 70-79 = decent, below 70 = weak.
- matchReason: one tight paragraph (2-3 sentences) explaining the score, grounded in the actual profile and posting.
- matchedSkills: skills the candidate genuinely has that this role needs.
- missingSkills: skills the role needs that the candidate's profile does not show.
Return ONLY valid JSON matching the schema. Never invent skills the candidate did not list.`

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.INTEGER, description: '0-100' },
    matchReason: { type: Type.STRING },
    matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
}

// Compact profile summary for the prompt — only the fields that drive a match,
// so the model isn't distracted by URLs/contact info.
function profileSummary(profile: Profile): string {
  const roles = (profile.work_experience ?? [])
    .map((r) => `${r.title} at ${r.company}: ${r.responsibilities}`)
    .join('\n')
  return [
    `Current title: ${profile.current_title ?? 'unknown'}`,
    `Experience level: ${profile.experience_level ?? 'unknown'}`,
    `Years of experience: ${profile.years_experience ?? 'unknown'}`,
    `Skills: ${(profile.skills ?? []).join(', ') || 'none listed'}`,
    `Industries: ${(profile.industries ?? []).join(', ') || 'none listed'}`,
    `Roles sought: ${(profile.job_titles_seeking ?? []).join(', ') || 'none listed'}`,
    roles ? `Work history:\n${roles}` : 'Work history: none listed'
  ].join('\n')
}

// Scores one Adzuna job against the profile. One Gemini call per job (chosen for
// robust structured output and clean per-job events), wrapped in the shared
// retry helper for the transient 503/429 spikes 2.5-flash throws under load.
export async function scoreJob(job: AdzunaJob, profile: Profile): Promise<ScoredJob> {
  const ai = getGemini()
  const contents = `CANDIDATE PROFILE:\n${profileSummary(profile)}\n\nJOB POSTING:\nTitle: ${job.title}\nCompany: ${job.company?.display_name ?? ''}\nLocation: ${job.location?.display_name ?? ''}\nDescription: ${job.description ?? ''}`

  const response = await generateWithRetry(ai, {
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.3,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingBudget: 0 }
    }
  })

  const raw = response.text
  if (!raw) {
    throw new Error('Model returned no score')
  }
  return sanitize(parseJsonLoose(raw))
}

// Defensive validation — clamp the score to 0-100, coerce the skill lists to
// clean string arrays, default a reason. Mirrors extract-profile's sanitize.
function sanitize(input: Record<string, unknown>): ScoredJob {
  return {
    matchScore: clampScore(input.matchScore),
    matchReason: str(input.matchReason) ?? 'No explanation provided.',
    matchedSkills: strArray(input.matchedSkills),
    missingSkills: strArray(input.missingSkills)
  }
}

function clampScore(value: unknown): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : NaN
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.trunc(n)))
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
}
