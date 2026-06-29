import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    desc: 'Try it out',
    monthly: 0,
    features: [
      { text: '3 prospects per run', yes: true },
      { text: '1 run per day', yes: true },
      { text: '10 follow-ups per day', yes: true },
      { text: 'India only', yes: true },
      { text: '1 seat', yes: true },
      { text: 'Manual sheet sync', yes: true },
      { text: 'Gmail integration', yes: false },
      { text: 'All 3 AI models', yes: false },
      { text: 'White label', yes: false },
    ],
    cta: 'Start free',
    primary: false,
    badge: null
  },
  {
    name: 'Starter',
    desc: 'Solo outreach',
    monthly: 29,
    features: [
      { text: '10 prospects per run', yes: true },
      { text: '3 runs per day', yes: true },
      { text: '50 follow-ups per day', yes: true },
      { text: 'India and USA', yes: true },
      { text: '1 seat', yes: true },
      { text: 'Auto sheet sync', yes: true },
      { text: 'Gmail integration', yes: true },
      { text: 'All 3 AI models', yes: false },
      { text: 'White label', yes: false },
    ],
    cta: 'Get started',
    primary: false,
    badge: null
  },
  {
    name: 'Pro',
    desc: 'Growing teams',
    monthly: 99,
    features: [
      { text: '15 prospects per run', yes: true },
      { text: '5 runs per day', yes: true },
      { text: '200 follow-ups per day', yes: true },
      { text: 'All 5 geographies', yes: true },
      { text: '3 seats', yes: true },
      { text: 'Auto sheet sync', yes: true },
      { text: 'Gmail integration', yes: true },
      { text: 'All 3 AI models', yes: true },
      { text: 'White label', yes: false },
    ],
    cta: 'Start Pro',
    primary: true,
    badge: 'Most popular'
  },
  {
    name: 'Agency',
    desc: 'Scale for clients',
    monthly: 299,
    features: [
      { text: '15 prospects per run', yes: true },
      { text: 'Unlimited runs', yes: true },
      { text: 'Unlimited follow-ups', yes: true },
      { text: 'All 5 geographies', yes: true },
      { text: '10 seats', yes: true },
      { text: 'Auto sheet sync', yes: true },
      { text: 'Gmail integration', yes: true },
      { text: 'All 3 AI models', yes: true },
      { text: 'White label', yes: true },
    ],
    cta: 'Contact us',
    primary: false,
    badge: null
  }
]

const faqs = [
  {
    q: "What counts as a run?",
    a: "One run = research agent finding prospects, observer verifying them, and email agent writing drafts. Sending follow-ups does not count as a run."
  },
  {
    q: "Why is there a follow-up limit?",
    a: "Follow-ups consume API credits too. Each follow-up email costs ~$0.0001 to write. Limits keep costs predictable and prevent runaway spend on large contact databases."
  },
  {
    q: "Does my data stay private?",
    a: "Yes. All contacts go into your own Google Sheet. We never store or see your prospect data. You own everything."
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes. Upgrades take effect immediately. Downgrades apply at the next billing cycle."
  },
  {
    q: "What AI models power this?",
    a: "Research uses Gemini 2.0 Flash, verification uses GPT-4o mini, and email writing uses Claude Haiku. Each model chosen for the specific task. Starter plan uses Gemini Flash only."
  }
]

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const getPrice = (monthly) => {
    if (monthly === 0) return 0
    return isAnnual ? Math.round(monthly * 0.8) : monthly
  }

  const getSaving = (monthly) => {
    if (monthly === 0 || !isAnnual) return null
    return Math.round((monthly - getPrice(monthly)) * 12)
  }

  return (
    <>
      <Head>
        <title>Pricing — B2B Outreach Agent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8f8f7', fontFamily: 'Inter, system-ui, sans-serif' }}>

        <div style={{ borderBottom: '1px solid #e5e5e3', background: '#fff', padding: '0 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>B2B Outreach</span>
                <span style={{ fontSize: 12, color: '#888', background: '#f0f0ef', padding: '2px 8px', borderRadius: 20 }}>Agent</span>
              </Link>
            </div>
            <Link href="/" style={{ fontSize: 13, color: '#555', textDecoration: 'none', border: '1px solid #e5e5e3', padding: '6px 14px', borderRadius: 6 }}>
              Back to app
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 2rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#A1003d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Pricing</p>
            <h1 style={{ fontSize: 32, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.25, marginBottom: 10 }}>Find verified prospects.<br />Send emails that get replies.</h1>
            <p style={{ fontSize: 15, color: '#666', marginBottom: 28 }}>Three AI agents working together. One flat monthly price.</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: isAnnual ? '#888' : '#1a1a1a', fontWeight: isAnnual ? 400 : 500 }}>Monthly</span>
              <div
                onClick={() => setIsAnnual(!isAnnual)}
                style={{ width: 40, height: 22, background: '#A1003d', borderRadius: 11, cursor: 'pointer', position: 'relative' }}
              >
                <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: isAnnual ? 21 : 3, transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: 13, color: isAnnual ? '#1a1a1a' : '#888', fontWeight: isAnnual ? 500 : 400 }}>Annual</span>
              <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Save 20%</span>
            </div>
          </div>

          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0369a1', marginBottom: '2rem', textAlign: 'center' }}>
            Your API cost per run of 15 prospects: <strong>~$0.004</strong> &nbsp;·&nbsp; At 5 runs/day + follow-ups: <strong>~$0.53/user/month</strong> &nbsp;·&nbsp; Your margin at every plan: <strong>95%+</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '3rem' }}>
            {plans.map((plan) => {
              const price = getPrice(plan.monthly)
              const saving = getSaving(plan.monthly)
              return (
                <div key={plan.name} style={{ background: '#fff', border: plan.primary ? '2px solid #A1003d' : '1px solid #e5e5e3', borderRadius: 12, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column' }}>
                  {plan.badge && (
                    <span style={{ fontSize: 11, background: '#fff0f3', color: '#5e0023', padding: '3px 10px', borderRadius: 20, fontWeight: 500, alignSelf: 'flex-start', marginBottom: 10 }}>
                      {plan.badge}
                    </span>
                  )}
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 }}>{plan.name}</p>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.4 }}>{plan.desc}</p>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 500, color: '#1a1a1a' }}>${price}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{plan.monthly > 0 ? '/mo' : ''}</span>
                  </div>
                  <p style={{ fontSize: 11, color: saving ? '#16a34a' : '#aaa', marginBottom: 16, minHeight: 16 }}>
                    {saving ? `Save $${saving}/year` : plan.monthly > 0 ? isAnnual ? `$${price * 12}/year` : `$${plan.monthly * 12}/year billed monthly` : ''}
                  </p>
                  <button style={{ fontSize: 13, padding: '8px', borderRadius: 6, cursor: 'pointer', marginBottom: 16, fontWeight: 500, border: plan.primary ? 'none' : '1px solid #d1d5db', background: plan.primary ? '#1a1a1a' : '#fff', color: plan.primary ? '#fff' : '#1a1a1a', width: '100%' }}>
                    {plan.cta}
                  </button>
                  <div style={{ height: 1, background: '#f0f0ef', marginBottom: 14 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: '#555', lineHeight: 1.4 }}>
                        <span style={{ color: f.yes ? '#16a34a' : '#ccc', marginTop: 1, fontSize: 13, flexShrink: 0 }}>
                          {f.yes ? '✓' : '✗'}
                        </span>
                        {f.text}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Common questions</p>
            {faqs.map((faq, i) => (
              <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid #f0f0ef' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 5 }}>{faq.q}</p>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
