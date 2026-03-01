'use client'
import { useState } from 'react'
import useApexStore from '@/store/apexStore'

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
export const FREE_LIMITS = {
  positions: 5,
  alerts: 20,
  monteCarlo: false,
  taxEngine: false,
  stressTests: 3,
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
        setError('Stripe not set up yet. Add STRIPE_SECRET_KEY to .env.local.')
        setLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Network error — please try again')
    }
    setLoading(null)
  }

  const plans = [
    { id: 'pro', name: 'Pro', price: '$29', color: '#4f6ef7', features: PRO_FEATURES, cta: 'Upgrade to Pro' },
    { id: 'expert', name: 'Expert', price: '$99', color: '#f0b429', features: EXPERT_FEATURES, cta: 'Upgrade to Expert' },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{ display: open ? 'flex' : 'none' }}
    >
      <div className="bg-[#0f1326] border border-[#222845] rounded-2xl p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">⚡</div>
          <h2 className="font-display text-2xl font-bold italic text-white mb-2">
            {reason || 'Unlock Full Access'}
          </h2>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4 text-center">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-xl p-5 flex flex-col" style={{ borderColor: plan.color + '44', background: plan.color + '08' }}>
              <div className="font-bold text-base mb-1" style={{ color: plan.color }}>{plan.name}</div>
              <div className="text-2xl font-bold mb-4" style={{ color: plan.color }}>{plan.price}<span className="text-xs font-normal opacity-60">/mo</span></div>
              <ul className="flex-1 mb-4 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-[#8892b0]">
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={!!loading}
                className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-all"
                style={{ background: plan.color }}
              >
                {loading === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button onClick={onClose} className="text-[#3d4a6b] text-xs hover:text-[#8892b0]">Continue with free plan</button>
        </div>
      </div>
    </div>
  )
}

// ── Freemium Banner ───────────────────────────────────────────────────────────
export function FreemiumBanner() {
  const { positionsLeft, tier } = useGate()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // ✅ FIX: Logic is calculated, but we don't return early.
  // This ensures the UpgradeModal below is ALWAYS called, keeping hook counts stable.
  const isVisible = tier === 'free' && !dismissed && positionsLeft <= 2

  return (
    <>
      {isVisible && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 bg-[rgba(79,110,247,0.1)] border border-[rgba(79,110,247,0.25)] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <div>
              <div className="text-xs font-semibold text-[#7390fa]">
                {positionsLeft === 0 ? 'Limit reached — upgrade for more' : `${positionsLeft} free slots left`}
              </div>
              <div className="text-[10px] text-[#3d4a6b]">Pro unlocks unlimited positions + Monte Carlo</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="bg-[#4f6ef7] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg">Upgrade</button>
            <button onClick={() => setDismissed(true)} className="text-[#3d4a6b] text-xs px-2">✕</button>
          </div>
        </div>
      )}
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason="Unlock Unlimited Positions" />
    </>
  )
}

// ── Locked Feature Overlay ────────────────────────────────────────────────────
export function LockedFeature({ feature, children }) {
  const { isPro } = useGate()
  const [open, setOpen] = useState(false)

  // ✅ FIX: Even if user is Pro, we still render the structure (hidden) to keep hooks consistent.
  return (
    <>
      <div className="relative">
        <div className={isPro ? "" : "opacity-20 pointer-events-none select-none blur-[2px]"}>
          {children}
        </div>
        
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-[#0f1326] border border-[#222845] rounded-xl p-6 shadow-xl">
              <div className="text-3xl mb-3">🔒</div>
              <div className="font-display text-lg font-bold italic mb-2">{feature}</div>
              <button
                onClick={() => setOpen(true)}
                className="bg-[#4f6ef7] text-white text-sm font-semibold px-5 py-2 rounded-lg"
              >
                Unlock for $29/mo →
              </button>
            </div>
          </div>
        )}
      </div>
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason={`Unlock ${feature}`} />
    </>
  )
}