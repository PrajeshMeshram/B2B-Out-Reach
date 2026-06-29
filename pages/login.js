import { signIn } from 'next-auth/react'
import Head from 'next/head'

export default function Login() {
  return (
    <>
      <Head>
        <title>Sign in — B2B Outreach</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #180008 0%, #5e0023 60%, #A1003d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem'
      }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>B2B Outreach</div>
          <h1 style={{ fontSize: 36, fontWeight: 500, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>Find verified prospects.<br />Send emails that convert.</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 360 }}>Three AI agents — research, verify, write. All connected to your Gmail and Google Sheets.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 380 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6, textAlign: 'center' }}>Get started</p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 24, textAlign: 'center' }}>Sign in to connect your Google account. We use it to access your Gmail and create your contacts sheet.</p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            style={{
              width: '100%', padding: '12px 16px', border: '1px solid #e5e5e3',
              borderRadius: 8, background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14, fontWeight: 500, color: '#1a1a1a'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
            We request access to Gmail (compose only) and Google Sheets (your data only). We never read your existing emails.
          </p>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
          {['86% CAC reduction', '15:1 LTV:CAC', '3 AI agents'].map(s => (
            <div key={s} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#A1003d' }}>✓</span> {s}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
