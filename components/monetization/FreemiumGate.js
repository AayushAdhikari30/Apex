'use client'
import { useState } from 'react'
import useApexStore from '@/store/apexStore'

// ── Plan limits for free tier ─────────────────────────────────────────────────
export const FREE_LIMITS = {
  positions: 5,
  alerts: 20,
  monteCarlo: false,
  taxEngine: false,
  stressTests: 3, // only first 3 scenarios
  exportReport: false,
}

export const PRO_FEATURES = [
  'Unlimited positions',
  'Monte Carlo simulation (1,000 paths)',
  'Full Tax Engine + TLH',
  'All 6 stress test scenarios',
  'CSV export reports',
  'Priority alert system',
  'Auto-sync every 60s',
]

export const EXPERT_FEATURES = [
  'Everything in Pro',
  'API access for automation',
  'Portfolio consultation (1hr/mo)',
  'Custom macro signal config',
  'White-label export PDFs',
  'Priority email support',
]

// ── Hook: check if user can do an action ──────────────────────────────────────
export function useGate() {
  const { user, positions } = useApexStore()
  const tier = user?.tier || 'free'
  const isPro = tier === 'pro' || tier === 'expert'
  const isExpert = tier === 'expert'

  return {
    tier,
    isPro,
    isExpert,
    canAddPosition: isPro || positions.length < FREE_LIMITS.positions,
    canUseMonteCarlo: isPro,
    canUseTaxEngine: isPro,
    canExport: isPro,
    canUseAllStress: isPro,
    positionsLeft: Math.max(0, FREE_LIMITS.positions - positions.length),
  }
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
export function UpgradeModal({ open, onClose, reason }) {
  const { user } = useApexStore()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  if (!open) return null

  const handleUpgrade = async (plan) => {
    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userEmail: user.email, userId: user.id }),
      })
      const data = await res.json()

      if (data.demo) {
        // Stripe not configured — show instructions
        setError('Stripe not set up yet. Add STRIPE_SECRET_KEY to .env.local to enable real payments.')
        setLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url // redirect to Stripe checkout
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Network error — please try again')
    }
    setLoading(null)
  }

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      color: '#4f6ef7',
      features: PRO_FEATURES,
      cta: 'Upgrade to Pro',
    },
    {
      id: 'expert',
      name: 'Expert',
      price: '$99',
      period: '/month',
      color: '#f0b429',
      features: EXPERT_FEATURES,
      cta: 'Upgrade to Expert',
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-[#0f1326] border border-[#222845] rounded-2xl p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">⚡</div>
          <h2 className="font-display text-2xl font-bold italic text-white mb-2">
            {reason || 'Unlock Full Access'}
          </h2>
          <p className="text-[#8892b0] text-sm">
            Upgrade to keep building your portfolio engine.
          </p>
        </div>

        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg px-4 py-3 text-[#f87171] text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border rounded-xl p-5 flex flex-col"
              style={{ borderColor: plan.color + '44', background: plan.color + '08' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-base" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="font-display text-2xl font-bold italic" style={{ color: plan.color }}>
                    {plan.price}<span className="text-sm font-normal font-sans text-[#8892b0]">{plan.period}</span>
                  </div>
                </div>
              </div>
              <ul className="flex-1 mb-4 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-[#8892b0]">
                    <span style={{ color: plan.color }} className="mt-[1px] flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={!!loading}
                className="w-full py-[10px] rounded-lg text-white text-sm font-semibold cursor-pointer border-none transition-all disabled:opacity-60"
                style={{ background: plan.color }}
              >
                {loading === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Free tier reminder */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-[#3d4a6b] text-xs cursor-pointer border-none bg-transparent hover:text-[#8892b0] transition-colors"
          >
            Continue with free plan (limited features)
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Freemium Banner — shown at top when user is near limit ────────────────────
export function FreemiumBanner() {
  const { positionsLeft, tier, canAddPosition } = useGate()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (tier !== 'free' || dismissed) return null
  if (positionsLeft > 2) return null // only show when close to limit

  return (
    <>
      <div className="mx-4 mt-3 flex items-center justify-between gap-3 bg-[rgba(79,110,247,0.1)] border border-[rgba(79,110,247,0.25)] rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚡</span>
          <div>
            <div className="text-xs font-semibold text-[#7390fa]">
              {positionsLeft === 0
                ? 'Position limit reached — upgrade to add more'
                : `${positionsLeft} free position${positionsLeft !== 1 ? 's' : ''} left`}
            </div>
            <div className="text-[10px] text-[#3d4a6b]">
              Pro unlocks unlimited positions + Monte Carlo + Tax Engine
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="bg-[#4f6ef7] text-white text-[11px] font-semibold px-3 py-[6px] rounded-lg border-none cursor-pointer hover:bg-[#7390fa] transition-colors"
          >
            Upgrade $29/mo
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#3d4a6b] text-xs border-none bg-transparent cursor-pointer hover:text-[#8892b0]"
          >✕</button>
        </div>
      </div>
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason="Unlock Unlimited Positions" />
    </>
  )
}

// ── Locked Feature Overlay — wraps any premium page ──────────────────────────
export function LockedFeature({ feature, children }) {
  const { isPro } = useGate()
  const [open, setOpen] = useState(false)

  if (isPro) return children

  return (
    <>
      <div className="relative">
        <div className="opacity-20 pointer-events-none select-none blur-[2px]">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-[#0f1326] border border-[#222845] rounded-xl p-6 shadow-xl">
            <div className="text-3xl mb-3">🔒</div>
            <div className="font-display text-lg font-bold italic mb-2">{feature}</div>
            <div className="text-[#8892b0] text-xs mb-4">Available on Pro & Expert plans</div>
            <button
              onClick={() => setOpen(true)}
              className="bg-[#4f6ef7] text-white text-sm font-semibold px-5 py-2 rounded-lg border-none cursor-pointer hover:bg-[#7390fa] transition-colors"
            >
              Unlock for $29/mo →
            </button>
          </div>
        </div>
      </div>
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason={`Unlock ${feature}`} />
    </>
  )
}
