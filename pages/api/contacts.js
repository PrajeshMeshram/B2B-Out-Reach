import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { getSheetContacts, updateFollowup, updateStatus, getOrCreateSheet } from '../../lib/sheets'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Not signed in' })
  const token = session.accessToken
  const sheetId = await getOrCreateSheet(token)

  if (req.method === 'GET') {
    try {
      const contacts = await getSheetContacts(token, sheetId)
      res.status(200).json({ contacts, sheetId })
    } catch (err) { res.status(500).json({ error: err.message }) }
  }

  if (req.method === 'PATCH') {
    const { email, action, followupNum } = req.body
    try {
      if (action === 'followup') await updateFollowup(token, sheetId, email, followupNum)
      if (action === 'replied') await updateStatus(token, sheetId, email, 'Replied')
      if (action === 'closed') await updateStatus(token, sheetId, email, 'Closed')
      res.status(200).json({ success: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
}
