import {
  DEGREE_OPTIONS,
  EXPERIENCE_LEVELS,
  REMOTE_PREFERENCES,
  WORK_AUTHORIZATIONS,
} from '../../lib/profile'
import type {
  Education,
  ExperienceLevel,
  ExtractedProfile,
  RemotePreference,
  WorkAuthorization,
  WorkExperienceEntry,
} from '../../types'
import { chatJson, parseJsonLoose } from './openai'

const MAX_ROLES = 3
const MAX_OUTPUT_TOKENS = 8192

const EXPERIENCE_VALUES = EXPERIENCE_LEVELS.map((o) => o.value)
const REMOTE_VALUES = REMOTE_PREFERENCES.map((o) => o.value)
const WORK_AUTH_VALUES = WORK_AUTHORIZATIONS.map((o) => o.value)

// Without a responseSchema (gpt-4o JSON mode is schema-free) the prompt has to
// carry the exact shape and the allowed enum values. The sanitize() pass below
// drops any blank or off-enum value the model returns anyway, so this is a
// hint, not a hard contract.
const SHAPE_HINT = `Return ONLY a JSON object with these keys. Omit a key or use "" when the resume does not clearly support it — never guess:
{
  "full_name": string,
  "phone": string,
  "location": "City, Country",
  "current_title": "most recent job title",
  "experience_level": one of [${EXPERIENCE_VALUES.join(', ')}],
  "years_experience": integer,
  "skills": string[],
  "industries": string[],
  "work_experience": [{ "company": string, "title": string, "start_date": "YYYY-MM", "end_date": "YYYY-MM ('' if current role)", "currently_working": boolean, "responsibilities": string }],
  "education": { "degree": one of [${DEGREE_OPTIONS.join(', ')}], "field": string, "institution": string, "year": "YYYY" },
  "job_titles_seeking": string[],
  "remote_preference": one of [${REMOTE_VALUES.join(', ')}],
  "preferred_locations": string[],
  "salary_expectation": string,
  "linkedin_url": string,
  "portfolio_url": string,
  "work_authorization": one of [${WORK_AUTH_VALUES.join(', ')}]
}`

const SYSTEM_PROMPT = `You extract a candidate's profile from the raw text of their resume.
Only fill a field when the resume clearly supports it — leave anything you are unsure about empty rather than guessing.
Map values onto the allowed enums exactly. Use the YYYY-MM format for dates where possible (YYYY for graduation year).
Return at most ${MAX_ROLES} work experience entries, most recent first.
${SHAPE_HINT}`

export async function extractProfileFromText(text: string): Promise<ExtractedProfile> {
  const raw = await chatJson({
    system: SYSTEM_PROMPT,
    user: `Extract the candidate's profile from this resume text:\n\n${text}`,
    temperature: 0.2,
    maxTokens: MAX_OUTPUT_TOKENS,
  })

  if (!raw) {
    throw new Error('Model returned no structured profile')
  }
  return sanitize(parseJsonLoose(raw))
}

// JSON mode constrains the model, but the result flows straight into a form the
// user saves, so validate defensively: drop blanks/invalid enums, cap roles,
// coerce years to a non-negative int. Only fields actually found are returned,
// so the client can merge them over the existing profile.
function sanitize(input: Record<string, unknown>): ExtractedProfile {
  const out: ExtractedProfile = {}

  const fullName = str(input.full_name)
  if (fullName) out.full_name = fullName
  const phone = str(input.phone)
  if (phone) out.phone = phone
  const location = str(input.location)
  if (location) out.location = location
  const currentTitle = str(input.current_title)
  if (currentTitle) out.current_title = currentTitle

  const experienceLevel = oneOf(input.experience_level, EXPERIENCE_VALUES)
  if (experienceLevel) out.experience_level = experienceLevel as ExperienceLevel
  const remotePreference = oneOf(input.remote_preference, REMOTE_VALUES)
  if (remotePreference) out.remote_preference = remotePreference as RemotePreference
  const workAuthorization = oneOf(input.work_authorization, WORK_AUTH_VALUES)
  if (workAuthorization) out.work_authorization = workAuthorization as WorkAuthorization

  const years = toInt(input.years_experience)
  if (years !== undefined && years >= 0) out.years_experience = years

  const skills = strArray(input.skills)
  if (skills) out.skills = skills
  const industries = strArray(input.industries)
  if (industries) out.industries = industries
  const jobTitlesSeeking = strArray(input.job_titles_seeking)
  if (jobTitlesSeeking) out.job_titles_seeking = jobTitlesSeeking
  const preferredLocations = strArray(input.preferred_locations)
  if (preferredLocations) out.preferred_locations = preferredLocations

  const salary = str(input.salary_expectation)
  if (salary) out.salary_expectation = salary
  const linkedin = str(input.linkedin_url)
  if (linkedin) out.linkedin_url = linkedin
  const portfolio = str(input.portfolio_url)
  if (portfolio) out.portfolio_url = portfolio

  const work = workExperience(input.work_experience)
  if (work.length) out.work_experience = work
  const education = educationOf(input.education)
  if (education) out.education = education

  return out
}

function workExperience(value: unknown): WorkExperienceEntry[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((role): role is Record<string, unknown> => !!role && typeof role === 'object')
    .map((role) => {
      const currentlyWorking = role.currently_working === true
      const endDate = monthStr(role.end_date)
      return {
        company: str(role.company) ?? '',
        title: str(role.title) ?? '',
        start_date: monthStr(role.start_date),
        end_date: currentlyWorking ? null : (endDate || null),
        currently_working: currentlyWorking,
        responsibilities: str(role.responsibilities) ?? '',
      }
    })
    .filter((role) => role.company || role.title)
    .slice(0, MAX_ROLES)
}

function educationOf(value: unknown): Education | null {
  if (!value || typeof value !== 'object') return null
  const edu = value as Record<string, unknown>
  const degree = oneOf(edu.degree, DEGREE_OPTIONS) ?? ''
  const field = str(edu.field) ?? ''
  const institution = str(edu.institution) ?? ''
  const year = str(edu.year) ?? ''
  if (!degree && !field && !institution && !year) return null
  return { degree, field, institution, year }
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

// The prompt asks for YYYY-MM, but JSON mode doesn't enforce formats — the model
// sometimes returns a bare year. `<input type="month">` only accepts YYYY-MM, so
// normalize here: keep valid YYYY-MM, coerce a bare YYYY to YYYY-01, drop the rest.
function monthStr(value: unknown): string {
  const s = str(value)
  if (!s) return ''
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return s
  const year = s.match(/^(\d{4})$/)
  return year ? `${year[1]}-01` : ''
}

function strArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const out = value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
  return out.length ? out : undefined
}

function oneOf(value: unknown, allowed: readonly string[]): string | undefined {
  return typeof value === 'string' && allowed.includes(value) ? value : undefined
}

function toInt(value: unknown): number | undefined {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : NaN
  return Number.isFinite(n) ? Math.trunc(n) : undefined
}
