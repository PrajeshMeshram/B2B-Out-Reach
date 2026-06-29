import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { callOpenRouter, extractJSON, MODELS } from '../../lib/openrouter'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Not signed in' })

  const { prospect } = req.body
  try {
    const systemPrompt = `You are a contact verification agent. Output ONLY raw JSON. No markdown. No backticks. Start with { end with }.`
    const userPrompt = `Verify: Is ${prospect.name} currently working as ${prospect.role} at ${prospect.company} in 2025-2026?
Is email ${prospect.email} a plausible format for ${prospect.company}?
Reply ONLY JSON no markdown: {"verified":true,"confidence":"high","note":"reason","corrected_email":"email or same"}`
    const { text, usage } = await callOpenRouter(systemPrompt, userPrompt, MODELS.observer, 200)
    const result = extractJSON(text, 'object')
    res.status(200).json({ ...result, cost_usd: usage.cost_usd })
  } catch (err) {
    res.status(500).json({ error: err.message, verified: false })
  }
}
