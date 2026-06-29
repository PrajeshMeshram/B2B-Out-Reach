import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { callOpenRouter, extractJSON, MODELS } from '../../lib/openrouter'
import { getExistingCompanies, isDuplicate, getOrCreateSheet } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Not signed in' })

  const { stages, geos, industries, roles, count } = req.body
  const token = session.accessToken

  try {
    const sheetId = await getOrCreateSheet(token)
    const existingCompanies = await getExistingCompanies(token, sheetId)
    const exclusionNote = existingCompanies.length > 0
      ? `IMPORTANT: Do NOT include these companies — already contacted: ${existingCompanies.join(', ')}.` : ''

    const systemPrompt = `You are a B2B sales research assistant. Output ONLY raw JSON arrays with no markdown, no code fences, no explanation. Start with [ and end with ].`
    const userPrompt = `${exclusionNote}
Find ${count} real ${stages.join(' or ')} B2B SaaS companies from ${geos.join(', ')} in: ${industries.join(', ')}.
Role hierarchy: 1. Head of Marketing 2. VP Marketing 3. Director Marketing 4. CMO 5. CEO (only if owns marketing)
Return JSON array only. No markdown. Start with [ end with ]:
[{"name":"Full Name","role":"exact current role","company":"Company Name","stage":"Series A","industry":"industry","country":"country","email":"firstname@companydomain.com","roleLevel":1,"company_win":"one real specific achievement","company_problem":"one specific marketing or scaling challenge they face now","subject_line":"subject using first name max 8 words no em dashes creates curiosity","email_body":"4 paragraphs: 1) genuine company observation 2) their specific marketing challenge 3) short intro about GTM consultancy that helped B2B SaaS cut CAC by 86 percent 4) Would love to swap notes for 20 minutes. No pitch just two marketers talking shop. No em dashes. Human tone. Under 120 words."}]`

    const { text, usage } = await callOpenRouter(systemPrompt, userPrompt, MODELS.research, 4000)
    const prospects = extractJSON(text, 'array')

    const filtered = []
    for (const p of prospects) {
      const dup = await isDuplicate(token, sheetId, p.email)
      if (!dup) filtered.push(p)
    }

    res.status(200).json({ prospects: filtered, usage, sheetId, existingSkipped: existingCompanies.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
