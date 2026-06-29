import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { appendContact, isDuplicate, getOrCreateSheet } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Not signed in' })
  const { contact, sheetId } = req.body
  const token = session.accessToken
  try {
    const sid = sheetId || await getOrCreateSheet(token)
    const dup = await isDuplicate(token, sid, contact.email)
    if (dup) return res.status(409).json({ error: 'Duplicate: ' + contact.email })
    await appendContact(token, sid, contact)
    res.status(200).json({ success: true, sheetId: sid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
