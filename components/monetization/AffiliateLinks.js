'use client'
import { useState } from 'react'

// ── Affiliate partner config ───────────────────────────────────────────────────
// Replace href values with your actual affiliate links after signing up
const AFFILIATES = {
  // Crypto
  BTC: {
    broker: 'Coinbase',
    logo: '🟡',
    tagline: 'Buy BTC with zero fees on first trade',
    cta: 'Open Coinbase →',
    href: 'https://coinbase.com/join/YOUR_REF_CODE', // ← replace with your link
    commission: '$10 per signup',
    color: '#0052ff',
  },
  ETH: {
    broker: 'Coinbase',
    logo: '🟡',
    tagline: 'Trade ETH with industry-low fees',
    cta: 'Open Coinbase →',
    href: 'https://coinbase.com/join/YOUR_REF_CODE',
    commission: '$10 per signup',
    color: '#0052ff',
  },
  // Stocks & ETFs
  SPY: {
    broker: 'Interactive Brokers',
    logo: '📊',
    tagline: 'Trade SPY with the lowest margin rates',
    cta: 'Open IBKR Account →',
    href: 'https://www.interactivebrokers.com/referral/YOUR_REF_CODE', // ← replace
    commission: 'Up to $200 per account',
    color: '#e31937',
  },
  QQQ: {
    broker: 'Interactive Brokers',
    logo: '📊',
    tagline: 'Commission-free ETF trading',
    cta: 'Open IBKR Account →',
    href: 'https://www.interactivebrokers.com/referral/YOUR_REF_CODE',
    commission: 'Up to $200 per account',
    color: '#e31937',
  },
  // Bonds
  TLT: {
    broker: 'Interactive Brokers',
    logo: '📊',
    tagline: 'Best bond rates + Treasury Direct access',
    cta: 'Open IBKR Account →',
    href: 'https://www.interactivebrokers.com/referral/YOUR_REF_CODE',
    commission: 'Up to $200 per account',
    color: '#e31937',
  },
  // Gold
  XAU: {
    broker: 'Goldmoney',
    logo: '🥇',
    tagline: 'Buy allocated gold — fully insured vault storage',
    cta: 'Open Goldmoney Account →',
    href: 'https://www.goldmoney.com/?gmref=YOUR_REF_CODE', // ← replace
    commission: '1% of first deposit',
    color: '#f0b429',
  },
  // Default for anything else
  DEFAULT: {
    broker: 'TradingView',
    logo: '📈',
    tagline: 'Advanced charting for this position',
    cta: 'Open TradingView →',
    href: 'https://www.tradingview.com/?aff_id=YOUR_AFF_ID', // ← replace
    commission: '30% recurring commission',
    color: '#2962ff',
  },
}

// ── Inline affiliate card (shown inside position rows) ────────────────────────
export function AffiliateCard({ sym, compact = false }) {
  const aff = AFFILIATES[sym?.toUpperCase()] || AFFILIATES.DEFAULT
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (compact) {
    return (
      <a
        href={aff.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded border transition-all hover:opacity-80"
        style={{ color: aff.color, borderColor: aff.color + '44', background: aff.color + '10' }}
      >
        {aff.logo} {aff.broker} ↗
      </a>
    )
  }

  return (
    <div
      className="flex items-center justify-between gap-3 p-3 rounded-xl border mt-2"
      style={{ borderColor: aff.color + '33', background: aff.color + '08' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl flex-shrink-0">{aff.logo}</span>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-[#e2e8f0] truncate">{aff.broker}</div>
          <div className="text-[10px] text-[#8892b0] truncate">{aff.tagline}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={aff.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-[11px] font-semibold px-3 py-[5px] rounded-lg border-none cursor-pointer transition-all hover:opacity-80 whitespace-nowrap"
          style={{ background: aff.color, color: '#fff' }}
        >
          {aff.cta}
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#3d4a6b] text-xs border-none bg-transparent cursor-pointer hover:text-[#8892b0] flex-shrink-0"
        >✕</button>
      </div>
    </div>
  )
}

// ── Sidebar affiliate widget ──────────────────────────────────────────────────
export function AffiliateSidebar() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const featured = [
    AFFILIATES.BTC,
    AFFILIATES.SPY,
    AFFILIATES.XAU,
  ]

  return (
    <div className="mx-2 mb-2 bg-[#0c0f1f] border border-[#1a2035] rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[#3d4a6b]">Recommended Brokers</div>
        <button onClick={() => setDismissed(true)} className="text-[#3d4a6b] text-[10px] border-none bg-transparent cursor-pointer">✕</button>
      </div>
      <div className="space-y-2">
        {featured.map((aff) => (
          <a
            key={aff.broker + aff.href}
            href={aff.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#141930] transition-colors group"
          >
            <span className="text-base">{aff.logo}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-[#e2e8f0] group-hover:text-[#7390fa] transition-colors truncate">{aff.broker}</div>
              <div className="font-mono text-[8px] text-[#3d4a6b]">{aff.commission}</div>
            </div>
            <span className="text-[10px] text-[#3d4a6b] group-hover:text-[#4f6ef7]">↗</span>
          </a>
        ))}
      </div>
      <div className="font-mono text-[7px] text-[#3d4a6b] mt-2 text-center">Sponsored · We may earn a commission</div>
    </div>
  )
}

// ── Post-action affiliate prompt ──────────────────────────────────────────────
// Shows after user adds a position — naturally suggests broker
export function PostAddAffiliate({ sym, onClose }) {
  const aff = AFFILIATES[sym?.toUpperCase()] || AFFILIATES.DEFAULT

  return (
    <div className="fixed bottom-6 right-6 z-[150] w-[300px] bg-[#141930] border border-[#222845] rounded-2xl p-5 shadow-2xl animate-fade-up">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[10px] font-mono text-[#3d4a6b] mb-1">TRADE THIS ASSET</div>
          <div className="font-display text-base font-bold italic">{sym} → {aff.broker}</div>
        </div>
        <button onClick={onClose} className="text-[#3d4a6b] border-none bg-transparent cursor-pointer text-lg leading-none">✕</button>
      </div>
      <div className="text-[11px] text-[#8892b0] mb-4">{aff.tagline}</div>
      <a
        href={aff.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={onClose}
        className="block w-full py-[10px] rounded-xl text-white text-sm font-semibold text-center no-underline transition-all hover:opacity-90"
        style={{ background: aff.color }}
      >
        {aff.cta}
      </a>
      <div className="font-mono text-[8px] text-[#3d4a6b] mt-2 text-center">Sponsored · {aff.commission}</div>
    </div>
  )
}

// ── Dashboard revenue tracker (shows you what you've earned) ─────────────────
export function RevenueTracker() {
  // In production: fetch real data from your affiliate dashboards
  // For now shows placeholder to motivate setup
  const stats = [
    { platform: 'Coinbase Affiliate', clicks: 0, signups: 0, earned: 0, color: '#0052ff' },
    { platform: 'IBKR Affiliate', clicks: 0, signups: 0, earned: 0, color: '#e31937' },
    { platform: 'TradingView Affiliate', clicks: 0, signups: 0, earned: 0, color: '#2962ff' },
    { platform: 'Stripe Subscriptions', clicks: 0, signups: 0, earned: 0, color: '#635bff' },
  ]

  const total = stats.reduce((a, s) => a + s.earned, 0)

  return (
    <div>
      <div className="flex items-end gap-3 mb-4">
        <div>
          <div className="font-mono text-[9px] text-[#3d4a6b] uppercase tracking-widest mb-1">Total Earned</div>
          <div className="font-display text-[40px] font-bold italic text-[#34d399] leading-none">
            ${total.toFixed(2)}
          </div>
        </div>
        <div className="font-mono text-[10px] text-[#3d4a6b] pb-2">this month</div>
      </div>

      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.platform} className="flex items-center justify-between p-3 bg-[#0c0f1f] rounded-xl border border-[#1a2035]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <div>
                <div className="text-[11px] font-semibold">{s.platform}</div>
                <div className="font-mono text-[9px] text-[#3d4a6b]">{s.clicks} clicks · {s.signups} signups</div>
              </div>
            </div>
            <div className="font-display text-base italic font-bold text-[#34d399]">${s.earned.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-[rgba(79,110,247,0.07)] border border-[rgba(79,110,247,0.2)] rounded-xl text-[10px] text-[#7390fa]">
        💡 Add your affiliate IDs in <code className="font-mono">components/monetization/AffiliateLinks.js</code> to start tracking real earnings.
      </div>
    </div>
  )
}
