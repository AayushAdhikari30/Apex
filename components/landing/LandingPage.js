'use client'
import { useState } from 'react'

export default function LandingPage({ onGetStarted }) {
  const [hovered, setHovered] = useState(null)

  const features = [
    { icon: '▦', title: 'Three-Layer Capital System', desc: 'Safe (L1) · Growth (L2) · Speculative (L3) — scientifically allocated for your risk profile.' },
    { icon: '📉', title: 'Real-Time Risk Engine', desc: 'EGARCH volatility, CVaR, VaR, Sharpe ratio — institutional-grade risk analytics for every investor.' },
    { icon: '🎲', title: 'Monte Carlo Simulation', desc: '1,000 path simulation showing your 5th, median, and 95th percentile outcomes over 10 years.' },
    { icon: '▽', title: 'Profit Funnel Automation', desc: 'Mechanical rules rotate profits: Spec → Growth → Safe → Cash. No emotion. No mistakes.' },
    { icon: '⚡', title: 'Stress Test Suite', desc: '2008 crash, COVID, 2022 rate shock — see exactly how your portfolio holds up in every scenario.' },
    { icon: '$', title: 'Tax Engine', desc: 'Post-tax CAGR, bracket-aware rotation, and tax-loss harvesting opportunities — all automated.' },
  ]

  const plans = [
    {
      name: 'Free', price: '$0', period: '', color: '#64748b',
      features: ['5 positions', 'Dashboard & alerts', 'Basic portfolio engine', 'Layer health monitoring'],
      cta: 'Start Free', popular: false,
    },
    {
      name: 'Pro', price: '$29', period: '/mo', color: '#4f6ef7',
      features: ['Unlimited positions', 'Monte Carlo (1,000 paths)', 'Full Tax Engine + TLH', 'All 6 stress test scenarios', 'CSV export reports', 'Auto-sync every 60s'],
      cta: 'Start Pro Trial', popular: true,
    },
    {
      name: 'Expert', price: '$99', period: '/mo', color: '#f0b429',
      features: ['Everything in Pro', 'API access', '1hr consultation/month', 'Custom macro config', 'White-label PDF exports', 'Priority support'],
      cta: 'Go Expert', popular: false,
    },
  ]

  const stats = [
    { value: '3-Layer', label: 'Capital Framework' },
    { value: '1,000', label: 'Monte Carlo Paths' },
    { value: '6', label: 'Stress Scenarios' },
    { value: 'Live', label: 'Market Data' },
  ]

  return (
    <div className="min-h-screen bg-[#05070f] text-[#e2e8f0] overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a2035] sticky top-0 bg-[#05070f]/90 backdrop-blur-sm z-50">
        <div className="font-display text-2xl font-bold italic text-[#7390fa]">APEX</div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#8892b0]">
          <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="text-sm text-[#8892b0] border-none bg-transparent cursor-pointer hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="bg-[#4f6ef7] text-white text-sm font-semibold px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-[#7390fa] transition-colors"
          >
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[rgba(79,110,247,0.12)] border border-[rgba(79,110,247,0.25)] rounded-full px-4 py-2 text-[11px] font-mono text-[#7390fa] mb-6">
          <div className="w-[6px] h-[6px] rounded-full bg-[#34d399] animate-pulse" />
          Live market data · BTC, ETH, Gold, Macro signals
        </div>

        <h1 className="font-display text-5xl sm:text-6xl font-bold italic leading-tight mb-6">
          Your Portfolio.
          <br />
          <span className="text-[#7390fa]">Engineered.</span>
        </h1>

        <p className="text-[#8892b0] text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          APEX is a three-layer capital management system with institutional-grade risk analytics,
          live market data, and mechanical profit rotation — built for serious investors.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={onGetStarted}
            className="bg-[#4f6ef7] text-white font-semibold px-8 py-4 rounded-xl border-none cursor-pointer hover:bg-[#7390fa] transition-all text-base w-full sm:w-auto"
          >
            Start Free — No Credit Card →
          </button>
          <button
            onClick={onGetStarted}
            className="border border-[#1a2035] text-[#8892b0] font-semibold px-8 py-4 rounded-xl bg-transparent cursor-pointer hover:border-[#4f6ef7] hover:text-white transition-all text-base w-full sm:w-auto"
          >
            View Demo Portfolio
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-bold italic text-[#7390fa]">{s.value}</div>
              <div className="font-mono text-[9px] text-[#3d4a6b] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* App preview */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto bg-[#0f1326] border border-[#1a2035] rounded-2xl overflow-hidden shadow-2xl">
          {/* Fake toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#08091a] border-b border-[#1a2035]">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <div className="w-3 h-3 rounded-full bg-[#f0b429]" />
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            <div className="flex-1 mx-4 bg-[#0c0f1f] rounded-md px-3 py-1 text-[10px] font-mono text-[#3d4a6b]">
              apex.app/dashboard
            </div>
          </div>
          {/* KPI preview */}
          <div className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
              {[
                { l: 'Total Capital', v: '$247K', c: '#e2e8f0' },
                { l: 'Safe (L1)', v: '$111K', c: '#10b981' },
                { l: 'Growth (L2)', v: '$99K', c: '#4f6ef7' },
                { l: 'Speculative', v: '$37K', c: '#f97316' },
                { l: 'Blended CAGR', v: '11.2%', c: '#7390fa' },
                { l: 'Health Score', v: '94', c: '#34d399' },
              ].map((k) => (
                <div key={k.l} className="bg-[#0c0f1f] border border-[#1a2035] rounded-lg p-3">
                  <div className="font-mono text-[8px] text-[#3d4a6b] uppercase tracking-widest mb-1">{k.l}</div>
                  <div className="font-display text-xl font-bold italic" style={{ color: k.c }}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="h-16 bg-[#0c0f1f] border border-[#1a2035] rounded-xl flex items-center px-4 gap-4">
              {[{ w: '45%', c: '#10b981' }, { w: '40%', c: '#4f6ef7' }, { w: '10%', c: '#f97316' }, { w: '5%', c: '#64748b' }].map((b, i) => (
                <div key={i} className="h-4 rounded-full" style={{ width: b.w, background: b.c, opacity: 0.8 }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="font-mono text-[10px] text-[#4f6ef7] uppercase tracking-widest mb-3">Features</div>
          <h2 className="font-display text-4xl font-bold italic">Institutional tools.<br />Zero subscriptions to Wall Street.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#0f1326] border border-[#1a2035] rounded-2xl p-6 transition-all cursor-default hover:border-[#222845]"
              onMouseEnter={() => setHovered(f.title)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display text-lg font-bold italic mb-2">{f.title}</h3>
              <p className="text-[#8892b0] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-[#08091a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-[10px] text-[#4f6ef7] uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="font-display text-4xl font-bold italic">Simple, honest pricing.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-[#0f1326] border rounded-2xl p-6 flex flex-col ${plan.popular ? 'border-[#4f6ef7] shadow-[0_0_30px_rgba(79,110,247,0.15)]' : 'border-[#1a2035]'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4f6ef7] text-white font-mono text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className="font-bold text-base mb-1" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold italic" style={{ color: plan.color }}>{plan.price}</span>
                    <span className="text-[#3d4a6b] text-sm mb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#8892b0]">
                      <span style={{ color: plan.color }} className="flex-shrink-0 mt-[2px]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className="w-full py-3 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all hover:opacity-90"
                  style={{
                    background: plan.popular ? plan.color : 'transparent',
                    color: plan.popular ? '#fff' : plan.color,
                    border: plan.popular ? 'none' : `1px solid ${plan.color}44`,
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold italic mb-4">
            Start managing your portfolio like a pro.
          </h2>
          <p className="text-[#8892b0] mb-8">Free forever. Upgrade when you're ready.</p>
          <button
            onClick={onGetStarted}
            className="bg-[#4f6ef7] text-white font-semibold px-10 py-4 rounded-xl border-none cursor-pointer hover:bg-[#7390fa] transition-all text-base"
          >
            Launch APEX Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a2035] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="font-display text-lg font-bold italic text-[#7390fa]">APEX</div>
        <div className="font-mono text-[9px] text-[#3d4a6b]">
          Affiliate links on this site may earn us a commission at no cost to you.
        </div>
        <div className="font-mono text-[9px] text-[#3d4a6b]">© 2026 APEX · Not financial advice</div>
      </footer>
    </div>
  )
}
