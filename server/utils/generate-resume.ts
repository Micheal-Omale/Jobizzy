import { Type } from '@google/genai'
import type { Schema } from '@google/genai'
import type { Content, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces'
import type { Education, Profile, WorkExperienceEntry } from '../../types'
import { generateWithRetry, getGemini, parseJsonLoose } from './gemini'

// @types/pdfmake only types the browser build (`createPdf`, which needs a vfs).
// The server-side PdfPrinter is the package's untyped main entry, so load it via
// require with a minimal local type rather than fighting the shipped declaration.
interface PdfKitDocument {
  on(event: 'data', listener: (chunk: Buffer) => void): void
  on(event: 'end', listener: () => void): void
  on(event: 'error', listener: (error: Error) => void): void
  end(): void
}
type PdfPrinterCtor = new (fonts: TFontDictionary) => {
  createPdfKitDocument(documentDefinition: TDocumentDefinitions): PdfKitDocument
}
// Static import of pdfmake's Node entry (its `main`, src/printer.js — NOT the
// browser build). Must be static, not a dynamic createRequire: Vercel/Nitro's
// dependency tracer (node-file-trace) only follows static imports, so a dynamic
// require leaves pdfmake out of the serverless bundle → runtime "Cannot find
// module 'pdfmake'". The deep path also pins the Node build regardless of how
// Vite resolves the package's "browser" field during SSR.
import pdfPrinterModule from 'pdfmake/src/printer.js'
const PdfPrinter = pdfPrinterModule as unknown as PdfPrinterCtor

const MODEL = 'gemini-2.5-flash'
const MAX_BULLETS = 5
const MAX_OUTPUT_TOKENS = 2048

// AI writes only the prose — a summary and polished bullets per role. Company,
// title, dates, skills, and education come straight from the profile so nothing
// factual can be invented. pdfmake owns the layout deterministically.
const SYSTEM_PROMPT = `You are a professional resume writer. From the candidate's profile, write:
1. A concise professional summary (2-3 sentences, first-person implied, no "I"), grounded only in the profile.
2. For each role provided, 2-4 achievement-oriented bullet points rewritten from its responsibilities — strong action verbs, concrete and specific, no fabricated metrics or facts.
Return the same number of experience entries as roles, in the same order. Never invent employers, dates, or numbers that aren't in the profile.`

type RoleBullets = { bullets: string[] }
type ResumeContent = { summary: string; experience: RoleBullets[] }

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
  },
}

// Secondary text colour for contact line / dates / section rules. PDF output is
// not a Tailwind surface, so a literal grey here is fine — the no-hardcoded-hex
// rule governs Vue components, not generated documents.
const MUTED = '#6b7280'
const RULE = '#e5e7eb'

export async function generateResumePdf(profile: Profile): Promise<Buffer> {
  const roles = (profile.work_experience ?? []).filter(
    (role) => role.company || role.title,
  )
  const content = await writeResumeContent(profile, roles)
  const docDefinition = buildDocDefinition(profile, roles, content)
  return renderPdf(docDefinition)
}

async function writeResumeContent(
  profile: Profile,
  roles: WorkExperienceEntry[],
): Promise<ResumeContent> {
  const ai = getGemini()
  const input = {
    full_name: profile.full_name,
    current_title: profile.current_title,
    years_experience: profile.years_experience,
    experience_level: profile.experience_level,
    skills: profile.skills ?? [],
    industries: profile.industries ?? [],
    roles: roles.map((role) => ({
      company: role.company,
      title: role.title,
      responsibilities: role.responsibilities,
    })),
  }

  const response = await generateWithRetry(ai, {
    model: MODEL,
    contents: `Write resume prose for this candidate:\n\n${JSON.stringify(input)}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  })

  const raw = response.text
  if (!raw) throw new Error('Model returned no resume content')
  return normalise(parseJsonLoose(raw), roles)
}

// The bullets flow straight into the PDF, so validate defensively and guarantee
// one bullet list per role. If the model returned fewer entries than roles (or
// blanks), fall back to the role's own responsibilities text so no role renders
// empty.
function normalise(input: Record<string, unknown>, roles: WorkExperienceEntry[]): ResumeContent {
  const summary = typeof input.summary === 'string' ? input.summary.trim() : ''
  const fromModel = Array.isArray(input.experience) ? input.experience : []

  const experience: RoleBullets[] = roles.map((role, index) => {
    const entry = fromModel[index] as { bullets?: unknown } | undefined
    const bullets = cleanBullets(entry?.bullets)
    return { bullets: bullets.length ? bullets : fallbackBullets(role) }
  })

  return { summary, experience }
}

function cleanBullets(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, MAX_BULLETS)
}

function fallbackBullets(role: WorkExperienceEntry): string[] {
  return (role.responsibilities ?? '')
    .split(/\r?\n|•|·|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_BULLETS)
}

function buildDocDefinition(
  profile: Profile,
  roles: WorkExperienceEntry[],
  content: ResumeContent,
): TDocumentDefinitions {
  const body: Content[] = []

  body.push({ text: profile.full_name ?? 'Your Name', style: 'name' })
  if (profile.current_title) body.push({ text: profile.current_title, style: 'subtitle' })

  const contact = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin_url,
    profile.portfolio_url,
  ].filter((part): part is string => !!part && part.trim().length > 0)
  if (contact.length) body.push({ text: contact.join('  ·  '), style: 'contact' })

  if (content.summary) {
    body.push(sectionHeader('Summary'))
    body.push({ text: content.summary, style: 'body' })
  }

  const skills = (profile.skills ?? []).filter((skill) => skill.trim().length > 0)
  if (skills.length) {
    body.push(sectionHeader('Skills'))
    body.push({ text: skills.join('  ·  '), style: 'body' })
  }

  if (roles.length) {
    body.push(sectionHeader('Experience'))
    roles.forEach((role, index) => {
      body.push({
        columns: [
          {
            width: '*',
            text: [
              { text: role.title || 'Role', bold: true },
              role.company ? { text: `  —  ${role.company}`, color: MUTED } : '',
            ],
          },
          { width: 'auto', text: formatDates(role), style: 'dates' },
        ],
        margin: [0, 6, 0, 2],
      })
      const bullets = content.experience[index]?.bullets ?? []
      if (bullets.length) body.push({ ul: bullets, style: 'body', margin: [0, 0, 0, 2] })
    })
  }

  const education = formatEducation(profile.education)
  if (education) {
    body.push(sectionHeader('Education'))
    body.push({ text: education, style: 'body' })
  }

  return {
    pageSize: 'A4',
    pageMargins: [48, 48, 48, 48],
    defaultStyle: { font: 'Helvetica', fontSize: 10, color: '#111827', lineHeight: 1.25 },
    content: body,
    styles: {
      name: { fontSize: 22, bold: true, margin: [0, 0, 0, 2] },
      subtitle: { fontSize: 12, color: MUTED, margin: [0, 0, 0, 4] },
      contact: { fontSize: 9, color: MUTED, margin: [0, 0, 0, 4] },
      sectionHeader: { fontSize: 11, bold: true, margin: [0, 12, 0, 4] },
      body: { fontSize: 10, margin: [0, 0, 0, 2] },
      dates: { fontSize: 9, color: MUTED },
    },
  }
}

function sectionHeader(text: string): Content {
  return {
    table: {
      widths: ['*'],
      body: [
        [{ text: text.toUpperCase(), style: 'sectionHeader', border: [false, false, false, true] }],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      hLineColor: () => RULE,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 2,
    },
    margin: [0, 8, 0, 4],
  }
}

function formatDates(role: WorkExperienceEntry): string {
  const start = role.start_date?.trim() ?? ''
  const end = role.currently_working ? 'Present' : (role.end_date?.trim() ?? '')
  return [start, end].filter((part) => part.length > 0).join(' — ')
}

function formatEducation(education: Education | null): string {
  if (!education) return ''
  const degree = [education.degree, education.field].filter(Boolean).join(', ')
  const where = [education.institution, education.year].filter(Boolean).join(' · ')
  return [degree, where].filter((part) => part.length > 0).join('  —  ')
}

// The 14 standard PDF fonts are built into pdfkit, so Helvetica needs no font
// files or vfs — keeping the route dependency-light. Collect the document stream
// into a single Buffer for the route to return.
function renderPdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
  const printer = new PdfPrinter({
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
  })
  const pdfDoc = printer.createPdfKitDocument(docDefinition)
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk) => chunks.push(chunk))
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
    pdfDoc.on('error', reject)
    pdfDoc.end()
  })
}
