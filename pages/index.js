import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

const BRAND = 'linear-gradient(135deg, #180008 0%, #5e0023 60%, #A1003d 100%)'
const STAGES = ['Series A', 'Series B', 'Series C']
const GEOS = ['India', 'USA', 'EU', 'UK', 'UAE']
const INDUSTRIES = ['B2B SaaS', 'HR Tech', 'Fintech', 'EdTech', 'Dev Tools']

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stages, setStages] = useState(['Series A', 'Series B'])
  const [geos, setGeos] = useState(['India', 'USA'])
  const [industries, setIndustries] = useState(['B2B SaaS'])
  const [count, setCount] = useState(10)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const [prospects, setProspects] = useState([])
  const [contacts, setContacts] = useState([])
  const [tab, setTab] = useState('agent')
  const [totalCost, setTotalCost] = useState(0)
  const [sheetId, setSheetId] = useState(null)
  const [agentStatus, setAgentStatus] = useState({ research: 'idle', observer: 'idle', email: 'idle' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') loadContacts()
  }, [status])

  const addLog = (agent, msg) => {
    const time = new Date().toTimeString().slice(0, 8)
    setLog(prev => [...prev, { time, agent, msg }])
  }

  const loadContacts = async () => {
    const res = await fetch('/api/contacts')
    if (!res.ok) return
    const data = await res.json()
    if (data.contacts) setContacts(data.contacts)
    if (data.sheetId) setSheetId(data.sheetId)
  }

  const toggle = (arr, setArr, val) => setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const runAgents = async () => {
    if (!stages.length || !geos.length) return
    setRunning(true); setLog([]); setProspects([]); setTotalCost(0)
    let cost = 0

    setAgentStatus({ research: 'running', observer: 'idle', email: 'idle' })
    addLog('research', `Starting — ${stages.join(', ')} | ${geos.join(', ')}`)
    addLog('research', 'Reading your Google Sheet — checking existing contacts...')

    const resRes = await fetch('/api/research', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stages, geos, industries, roles: ['Head of Marketing', 'VP Marketing', 'Director Marketing', 'CMO', 'CEO'], count })
    })
    const resData = await resRes.json()
    if (resData.error) { addLog('research', `Error: ${resData.error}`); setAgentStatus(s => ({ ...s, research: 'error' })); setRunning(false); return }
    if (resData.sheetId) setSheetId(resData.sheetId)
    cost += parseFloat(resData.usage?.cost_usd || 0)
    addLog('research', `Skipped ${resData.existingSkipped} already-contacted companies`)
    addLog('research', `Found ${resData.prospects.length} new prospects`)
    setAgentStatus(s => ({ ...s, research: 'done', observer: 'running' }))

    const verified = []
    for (const p of resData.prospects) {
      addLog('observer', `Verifying ${p.name} at ${p.company}...`)
      const vRes = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prospect: p }) })
      const vData = await vRes.json()
      cost += parseFloat(vData.cost_usd || 0)
      if (vData.verified) {
        verified.push({ ...p, email: vData.corrected_email || p.email })
        addLog('observer', `✓ ${p.name} verified (${vData.confidence}) — ${vData.note}`)
      } else {
        addLog('observer', `✗ ${p.name} failed — ${vData.note}`)
      }
    }

    setAgentStatus(s => ({ ...s, observer: 'done', email: 'running' }))
    addLog('email', `Writing and saving ${verified.length} emails...`)

    for (const p of verified) {
      await fetch('/api/save-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: p, sheetId })
      })
      addLog('email', `Saved ${p.name} to your Google Sheet`)
    }

    setAgentStatus(s => ({ ...s, email: 'done' }))
    setProspects(verified)
    setTotalCost(cost.toFixed(4))
    addLog('email', `Done. ${verified.length} prospects ready. Total cost: $${cost.toFixed(4)}`)
    await loadContacts()
    setRunning(false)
  }

  const dot = (s) => {
    const c = { running: '#f59e0b', done: '#10b981', error: '#ef4444', idle: '#d1d5db' }[s] || '#d1d5db'
    return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 6 }} />
  }

  const daysAgo = (dateStr) => {
    if (!dateStr) return 0
    const parts = dateStr.split('-')
    if (parts.length !== 3) return 0
    const [d, m, y] = parts
    return Math.floor((Date.now() - new Date(`${y}-${m}-${d}`)) / 86400000)
  }

  const needsFollowup = (c) => {
    if (c.status === 'Replied' || c.status === 'Closed') return null
    if (!c.sent2 && daysAgo(c.sent1) >= 3) return 2
    if (c.sent2 && !c.sent3 && daysAgo(c.sent2) >= 4) return 3
    return null
  }

  const handleFollowup = async (c, num) => {
    await fetch('/api/contacts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: c.email, action: 'followup', followupNum: num }) })
    await loadContacts()
  }

  const handleStatus = async (c, action) => {
    await fetch('/api/contacts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: c.email, action }) })
    await loadContacts()
  }

  const dueCount = contacts.filter(c => needsFollowup(c)).length
  const repliedCount = contacts.filter(c => c.status === 'Replied').length

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ minHeight: '100vh', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Loading...</div>
    </div>
  }

  const chip = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1px solid', borderColor: active ? '#A1003d' : '#e5e5e3', background: active ? '#fff0f3' : '#fff', color: active ? '#5e0023' : '#666', cursor: 'pointer', fontWeight: active ? 500 : 400 }}>
      {label}
    </button>
  )

  return (
    <>
      <Head><title>B2B Outreach Agent</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ minHeight: '100vh', background: '#f8f8f7', fontFamily: 'Inter, system-ui, sans-serif' }}>

        <div style={{ background: BRAND, padding: '0 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>B2B Outreach</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 20 }}>Agent</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Link href="/pricing" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '6px 12px' }}>Pricing</Link>
              {['agent', 'crm'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, background: tab === t ? 'rgba(255,255,255,0.15)' : 'transparent', color: '#fff', fontWeight: tab === t ? 500 : 400 }}>
                  {t === 'agent' ? 'Agent' : `CRM${dueCount > 0 ? ` (${dueCount})` : ''}`}
                </button>
              ))}
              <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ fontSize: 12, padding: '5px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', marginLeft: 8 }}>
                Sign out
              </button>
            </div>
          </div>
        </div>

        {sheetId && (
          <div style={{ background: '#fff0f3', borderBottom: '1px solid #ffd6e0', padding: '8px 2rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', fontSize: 12, color: '#5e0023', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✓</span>
              <span>Connected to your Google Sheet —</span>
              <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noreferrer" style={{ color: '#A1003d', fontWeight: 500 }}>Open sheet ↗</a>
              <span style={{ color: '#aaa', marginLeft: 4 }}>· Gmail connected via your Google account</span>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem' }}>
          {tab === 'agent' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 14 }}>Configuration</p>

                  {[
                    { label: 'Funding stage', items: STAGES, selected: stages, set: setStages },
                    { label: 'Geography', items: GEOS, selected: geos, set: setGeos },
                    { label: 'Industry', items: INDUSTRIES, selected: industries, set: setIndustries },
                  ].map(({ label, items, selected, set }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 11, color: '#999', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {items.map(i => chip(i, selected.includes(i), () => toggle(selected, set, i)))}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 11, color: '#999', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prospects per run</p>
                    <select value={count} onChange={e => setCount(parseInt(e.target.value))} style={{ fontSize: 13, padding: '7px 10px', border: '1px solid #e5e5e3', borderRadius: 6, width: '100%', background: '#fff' }}>
                      {[5, 10, 15].map(n => <option key={n} value={n}>{n} prospects</option>)}
                    </select>
                  </div>

                  <button onClick={runAgents} disabled={running} style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 500, background: running ? '#e5e5e3' : BRAND, color: running ? '#888' : '#fff', border: 'none', borderRadius: 8, cursor: running ? 'not-allowed' : 'pointer' }}>
                    {running ? 'Running agents...' : 'Run agents'}
                  </button>
                  {totalCost > 0 && <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 8 }}>API cost this run: <strong>${totalCost}</strong></p>}
                </div>

                <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '1.25rem' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>Agents</p>
                  {[
                    { key: 'research', label: 'Research agent', desc: 'Gemini 2.0 Flash — finds prospects' },
                    { key: 'observer', label: 'Observer agent', desc: 'GPT-4o mini — verifies employment' },
                    { key: 'email', label: 'Email agent', desc: 'Claude Haiku — writes and saves' }
                  ].map(a => (
                    <div key={a.key} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>{dot(agentStatus[a.key])}<span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{a.label}</span></div>
                      <p style={{ fontSize: 11, color: '#aaa', marginTop: 2, marginLeft: 14 }}>{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {log.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', maxHeight: 180, overflowY: 'auto' }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity log</p>
                    {log.map((l, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 12 }}>
                        <span style={{ color: '#ccc', minWidth: 52 }}>{l.time}</span>
                        <span style={{ minWidth: 60, fontWeight: 500, color: l.agent === 'research' ? '#A1003d' : l.agent === 'observer' ? '#f59e0b' : '#10b981' }}>{l.agent}</span>
                        <span style={{ color: '#555' }}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {prospects.map((p, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 14, color: '#1a1a1a' }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{p.role} · {p.company} · {p.country}</p>
                          <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{p.email}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#fff0f3', color: '#5e0023' }}>{p.stage}</span>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a' }}>Verified</span>
                        </div>
                      </div>
                      <div style={{ background: '#fdf8f9', borderRadius: 8, padding: 10, borderLeft: '3px solid #A1003d' }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#A1003d', marginBottom: 5 }}>Subject: {p.subject_line}</p>
                        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.email_body}</p>
                      </div>
                    </div>
                  ))}

                  {prospects.length === 0 && log.length === 0 && (
                    <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                      Configure your run and click "Run agents" to find prospects
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'crm' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total contacted', val: contacts.length, color: '#1a1a1a' },
                  { label: 'Follow-up due', val: dueCount, color: '#f59e0b' },
                  { label: 'Replied', val: repliedCount, color: '#10b981' },
                  { label: 'Reply rate', val: contacts.length > 0 ? Math.round((repliedCount / contacts.length) * 100) + '%' : '0%', color: '#A1003d' }
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contacts.length === 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#888', fontSize: 13 }}>
                    No contacts yet. Run the agent to add prospects.
                  </div>
                )}
                {contacts.map((c, i) => {
                  const fu = needsFollowup(c)
                  return (
                    <div key={i} style={{ background: '#fff', border: `1px solid ${fu ? '#fbbf24' : '#e5e5e3'}`, borderRadius: 12, padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#5e0023', flexShrink: 0 }}>
                            {c.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 14, color: '#1a1a1a' }}>{c.name}</p>
                            <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{c.role} · {c.company} · {c.country}</p>
                            <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{c.email}</p>
                            {fu && <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>⏰ Follow-up {fu === 2 ? '1' : '2'} due ({daysAgo(c.sent1)} days since first email)</p>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#fff0f3', color: '#5e0023' }}>{c.stage}</span>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>{c.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {fu && <button onClick={() => handleFollowup(c, fu)} style={{ fontSize: 11, padding: '5px 10px', border: '1px solid #fbbf24', background: '#fffbeb', color: '#b45309', borderRadius: 6, cursor: 'pointer' }}>Send follow-up {fu === 2 ? '1' : '2'}</button>}
                        {c.status !== 'Replied' && <button onClick={() => handleStatus(c, 'replied')} style={{ fontSize: 11, padding: '5px 10px', border: '1px solid #e5e5e3', background: '#fff', color: '#555', borderRadius: 6, cursor: 'pointer' }}>Mark replied</button>}
                        {c.status !== 'Closed' && <button onClick={() => handleStatus(c, 'closed')} style={{ fontSize: 11, padding: '5px 10px', border: '1px solid #e5e5e3', background: '#fff', color: '#555', borderRadius: 6, cursor: 'pointer' }}>Close</button>}
                        {sheetId && <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '5px 10px', border: '1px solid #e5e5e3', background: '#fff', color: '#555', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>View in sheet ↗</a>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
