import { Type } from '@google/genai'
import type { Schema } from '@google/genai'
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
import { generateWithRetry, getGemini, parseJsonLoose } from './gemini'

// gemini-2.5-flash — better extraction quality and NOT hard-blocked the way
// 2.0-flash is on this key (2.0-flash returns 429 "limit: 0", i.e. no free-tier
// grant). NOTE: this key's project currently has no usable Gemini quota, so calls
// fail (2.5-flash → 503 "high demand") until billing/quota is enabled on the key.
// See progress-tracker. Once quota exists, 2.5-flash is the right default.
const MODEL = 'gemini-2.5-flash'
const MAX_ROLES = 3
const MAX_OUTPUT_TOKENS = 8192

const EXPERIENCE_VALUES = EXPERIENCE_LEVELS.map((o) => o.value)
const REMOTE_VALUES = REMOTE_PREFERENCES.map((o) => o.value)
const WORK_AUTH_VALUES = WORK_AUTHORIZATIONS.map((o) => o.value)

const SYSTEM_PROMPT = `You extract a candidate's profile from the raw text of their resume.
Only fill a field when the resume clearly supports it — leave anything you are unsure about empty rather than guessing.
Map values onto the allowed enums exactly. Use the YYYY-MM format for dates where possible (YYYY for graduation year).
Return at most ${MAX_ROLES} work experience entries, most recent first.`

// JSON mode + this schema makes the model reply with fields matching our profile
// shape (enums included) instead of free-form prose we'd have to parse.
const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    full_name: { type: Type.STRING },
    phone: { type: Type.STRING },
    location: { type: Type.STRING, description: 'City, Country' },
    current_title: { type: Type.STRING, description: 'Most recent job title' },
    experience_level: { type: Type.STRING, enum: EXPERIENCE_VALUES },
    years_experience: { type: Type.INTEGER },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    industries: { type: Type.ARRAY, items: { type: Type.STRING } },
    work_experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          title: { type: Type.STRING },
          start_date: { type: Type.STRING, description: 'YYYY-MM' },
          end_date: { type: Type.STRING, description: 'YYYY-MM, empty if current role' },
          currently_working: { type: Type.BOOLEAN },
          responsibilities: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.OBJECT,
      properties: {
        degree: { type: Type.STRING, enum: DEGREE_OPTIONS },
        field: { type: Type.STRING },
        institution: { type: Type.STRING },
        year: { type: Type.STRING, description: 'YYYY' },
      },
    },
    job_titles_seeking: { type: Type.ARRAY, items: { type: Type.STRING } },
    remote_preference: { type: Type.STRING, enum: REMOTE_VALUES },
    preferred_locations: { type: Type.ARRAY, items: { type: Type.STRING } },
    salary_expectation: { type: Type.STRING },
    linkedin_url: { type: Type.STRING },
    portfolio_url: { type: Type.STRING },
    work_authorization: { type: Type.STRING, enum: WORK_AUTH_VALUES },
  },
}

export async function extractProfileFromText(text: string): Promise<ExtractedProfile> {
  const ai = getGemini()
  const response = await generateWithRetry(ai, {
    model: MODEL,
    contents: `Extract the candidate's profile from this resume text:\n\n${text}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  })

  const raw = response.text
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
      const endDate = str(role.end_date)
      return {
        company: str(role.company) ?? '',
        title: str(role.title) ?? '',
        start_date: str(role.start_date) ?? '',
        end_date: currentlyWorking ? null : (endDate ?? null),
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
