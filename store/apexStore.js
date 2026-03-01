'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
export const LAYER_COLORS = {
  safe: '#10b981',
  growth: '#4f6ef7',
  spec: '#f97316',
  cash: '#64748b',
}

export const LAYER_NAMES = {
  safe: 'Safe (L1)',
  growth: 'Growth (L2)',
  spec: 'Speculative (L3)',
  cash: 'Cash Reserve',
}

export const LAYER_TARGETS = {
  safe: [35, 55],
  growth: [25, 45],
  spec: [5, 15],
  cash: [3, 8],
}

export const RISK_PROFILES = {
  conservative: { safe: 55, growth: 35, spec: 5, cash: 5 },
  balanced: { safe: 45, growth: 40, spec: 10, cash: 5 },
  growth: { safe: 40, growth: 42, spec: 13, cash: 5 },
  aggressive: { safe: 35, growth: 45, spec: 15, cash: 5 },
}

export const STRESS_SCENARIOS = [
  { id: 'gfc', name: '2008 Financial Crisis', icon: '💥', dd: 56, dur: 48, color: '#f87171', desc: 'Lehman collapse · Credit freeze · −56% S&P' },
  { id: 'covid', name: 'COVID Crash 2020', icon: '🦠', dd: 34, dur: 5, color: '#fb923c', desc: 'Fastest 30% crash in history · V-shaped recovery' },
  { id: 'rate22', name: '2022 Rate Shock ★', icon: '📈', dd: 25, dur: 18, color: '#fbbf24', desc: 'Bonds AND equities fell · 400bps hike cycle' },
  { id: 'china', name: 'China Hard Landing', icon: '🐉', dd: 22, dur: 12, color: '#a78bfa', desc: 'EM contagion · Trade disruption · Commodity shock' },
  { id: 'geo', name: 'Geopolitical Shock', icon: '⚔️', dd: 18, dur: 6, color: '#60a5fa', desc: 'Energy disruption · Supply chain fracture' },
  { id: 'sov', name: 'Sovereign Debt Crisis', icon: '🏦', dd: 30, dur: 24, color: '#f97316', desc: 'EU-style contagion · Credit event · Liquidity freeze' },
]

export const MILESTONES = [
  { value: 10000, label: 'First $10K', icon: '🌱' },
  { value: 50000, label: '$50K Threshold', icon: '🌿' },
  { value: 100000, label: 'Six Figures', icon: '💰' },
  { value: 250000, label: 'Quarter Million', icon: '⭐' },
  { value: 500000, label: 'Half Million', icon: '🚀' },
  { value: 1000000, label: 'Millionaire', icon: '👑' },
  { value: 2500000, label: '$2.5M — Wealth', icon: '💎' },
  { value: 5000000, label: '$5M — Freedom', icon: '🏆' },
]

// ── UTILITIES ──────────────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).substr(2, 9)
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const pct = (a, b) => (b > 0 ? (a / b) * 100 : 0)
export const rnd = (base, volatility) => Math.max(0.001, base * (1 + (Math.random() - 0.5) * 2 * (volatility / 100)))
export const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false })

export const fmt = (n) => {
  if (n === null || n === undefined) return '$0'
  const a = Math.abs(n)
  if (a >= 1e9) return (n < 0 ? '-' : '') + '$' + (a / 1e9).toFixed(2) + 'B'
  if (a >= 1e6) return (n < 0 ? '-' : '') + '$' + (a / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return (n < 0 ? '-' : '') + '$' + Math.round(a / 1e3).toLocaleString() + 'K'
  return (n < 0 ? '-' : '') + '$' + a.toFixed(2)
}

export const fmtShort = (n) => {
  const a = Math.abs(n || 0)
  if (a >= 1e6) return (n < 0 ? '-' : '') + '$' + (a / 1e6).toFixed(1) + 'M'
  if (a >= 1e3) return (n < 0 ? '-' : '') + '$' + Math.round(a / 1e3) + 'K'
  return (n < 0 ? '-' : '') + '$' + a.toFixed(0)
}

export const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

// ── STORE ──────────────────────────────────────────────────────────────────────
const useApexStore = create(
  persist(
    (set, get) => ({
      // User
      user: { name: '', email: '', tier: 'free', id: '' },

      // Portfolio
      positions: [],
      alloc: { safe: 45, growth: 40, spec: 10, cash: 5 },
      cfg: { C: 250000, prof: 'balanced', kel: 0.5, l3r: 18, vol: 20, rf: 4.5, floor: 70, tax: 15 },

      // Market Data
      prices: {
        BTC: { p: 0, c: 0 },
        ETH: { p: 0, c: 0 },
        XAU: { p: 0, c: 0 },
        SPY: { p: 548, c: 0.4 },
        VIX: { p: 18.4, c: 0 },
        TNX: { p: 4.42, c: 0 },
        DXY: { p: 103.2, c: 0 },
      },

      // Macro
      macro: { rate: 4.42, inf: 3.2, vix: 18.4, dxy: 103.2, spread: 300, geo: 4, mrs: 4.5 },
      regime: 'transition',
      markov: { expansion: 0.35, stagflation: 0.25, recession: 0.28, crisis: 0.12 },

      // Alerts & funnel log
      alerts: [],
      funnelLog: [],
      cooldowns: {},

      // Health score
      healthScore: 0,
      isDemo: false,
      lastSync: null,

      // ── Actions ──────────────────────────────────────────────────────────────

      setUser: (user) => set({ user }),

      setDemo: () => {
        set({
          isDemo: true,
          user: { name: 'Demo User', email: 'demo@apex.app', tier: 'pro', id: 'demo' },
          positions: [
            { id: uid(), sym: 'BTC', val: 25000, lyr: 'spec', ent: 87000, sl: 25, cur: 25000, type: 'Crypto', note: 'Core speculative position', ts: timestamp() },
            { id: uid(), sym: 'XAU', val: 45000, lyr: 'safe', ent: 2900, sl: 10, cur: 45000, type: 'Commodity', note: 'Gold safe-haven hedge', ts: timestamp() },
            { id: uid(), sym: 'SPY', val: 75000, lyr: 'growth', ent: 540, sl: 20, cur: 75000, type: 'Equity / ETF', note: 'Core S&P 500 growth', ts: timestamp() },
            { id: uid(), sym: 'QQQ', val: 35000, lyr: 'growth', ent: 460, sl: 20, cur: 35000, type: 'Equity / ETF', note: 'Tech growth overlay', ts: timestamp() },
            { id: uid(), sym: 'TLT', val: 55000, lyr: 'safe', ent: 85, sl: 12, cur: 55000, type: 'Bond / Fixed Income', note: 'Long Treasury safe layer', ts: timestamp() },
            { id: uid(), sym: 'ETH', val: 12000, lyr: 'spec', ent: 3100, sl: 30, cur: 12000, type: 'Crypto', note: 'Ethereum speculative', ts: timestamp() },
          ],
        })
      },

      addPosition: (pos) => {
        const newPos = { id: uid(), ...pos, cur: pos.val, ts: timestamp() }
        set((s) => ({ positions: [...s.positions, newPos] }))
        get().addAlert('ok', 'Position Added', `${pos.sym} · ${LAYER_NAMES[pos.lyr]} · ${fmtShort(pos.val)}`, true)
        get().addFunnelLog('info', `Added: ${pos.sym} → ${LAYER_NAMES[pos.lyr]} @ ${fmtShort(pos.val)}`)
      },

      removePosition: (id) => {
        const pos = get().positions.find((p) => p.id === id)
        if (pos) get().addFunnelLog('info', `Removed: ${pos.sym} from ${LAYER_NAMES[pos.lyr]}`)
        set((s) => ({ positions: s.positions.filter((p) => p.id !== id) }))
      },

      updatePositionPrices: (prices) => {
        set((s) => ({
          positions: s.positions.map((p) => {
            const livePrice = prices[p.sym]?.p
            if (livePrice && p.ent && livePrice > 0) {
              return { ...p, cur: Math.max(0, p.val * (livePrice / p.ent)) }
            }
            return p
          }),
        }))
      },

      setPrices: (prices) => set({ prices }),

      setMacro: (macro) => {
        const mrs = get().computeMRS({ ...get().macro, ...macro })
        set({ macro: { ...get().macro, ...macro, mrs } })
        get().autoClassifyRegime()
        get().updateMarkov()
      },

      computeMRS: (mac) => {
        const m = mac || get().macro
        const signals = [
          { v: m.rate, lo: 2, hi: 6, w: 0.2 },
          { v: m.inf, lo: 1, hi: 5, w: 0.2 },
          { v: m.vix, lo: 12, hi: 35, w: 0.2 },
          { v: m.spread, lo: 200, hi: 600, w: 0.1 },
          { v: m.geo, lo: 0, hi: 10, w: 0.15 },
          { v: m.dxy - 100, lo: -5, hi: 10, w: 0.15 },
        ]
        let mrs = 0
        signals.forEach((s) => (mrs += clamp((s.v - s.lo) / (s.hi - s.lo), 0, 1) * 10 * s.w))
        return +mrs.toFixed(1)
      },

      autoClassifyRegime: () => {
        const { macro } = get()
        const m = macro.mrs
        let regime = 'transition'
        if (m < 3) regime = 'expansion'
        else if (m < 5.5) regime = 'transition'
        else if (m < 7.5) regime = 'contraction'
        else regime = 'crisis'
        set({ regime })
      },

      updateMarkov: () => {
        const m = get().macro.mrs
        const e = Math.max(0.01, 1 - m / 10)
        const st = 0.15
        const re = clamp((m / 10) * 0.3, 0, 0.3)
        const cr = Math.max(0, m / 10 - 0.7) * 0.5
        const tot = e + st + re + cr
        set({ markov: { expansion: e / tot, stagflation: st / tot, recession: re / tot, crisis: cr / tot } })
      },

      setAlloc: (alloc) => set({ alloc }),
      setCfg: (cfg) => set((s) => ({ cfg: { ...s.cfg, ...cfg } })),
      applyProfile: (prof) => {
        const profile = RISK_PROFILES[prof] || RISK_PROFILES.balanced
        set({ alloc: profile })
        get().setCfg({ prof })
      },

      // Portfolio calc
      calcPortfolio: () => {
        const { positions } = get()
        const ly = { safe: 0, growth: 0, spec: 0, cash: 0 }
        let total = 0
        positions.forEach((p) => {
          ly[p.lyr] = (ly[p.lyr] || 0) + (p.cur || p.val)
          total += p.cur || p.val
        })
        return { ly, total }
      },

      calcHealthScore: () => {
        const { positions, alerts } = get()
        const { ly, total } = get().calcPortfolio()
        if (!total) return 0
        let score = 100
        Object.entries(LAYER_TARGETS).forEach(([k, [lo, hi]]) => {
          const pp = pct(ly[k] || 0, total)
          if (pp < lo - 5 || pp > hi + 5) score -= 15
          else if (pp < lo - 2 || pp > hi + 2) score -= 6
        })
        positions.forEach((p) => {
          if (p.ent && p.cur <= p.val * (1 - p.sl / 100)) score -= 20
        })
        const warnCt = alerts.filter((a) => a.type === 'warn').length
        score -= Math.min(warnCt * 4, 16)
        return Math.max(0, Math.min(100, Math.round(score)))
      },

      // Alerts
      addAlert: (type, title, body, force = false) => {
        const key = type + ':' + title
        const now = Date.now()
        const { cooldowns } = get()
        if (!force && cooldowns[key] && now - cooldowns[key] < 300000) return
        const alert = { id: uid(), type, title, body, time: timestamp() }
        set((s) => ({
          alerts: [alert, ...s.alerts].slice(0, 100),
          cooldowns: { ...s.cooldowns, [key]: now },
        }))
      },

      clearAlerts: () => set({ alerts: [], cooldowns: {} }),

      addFunnelLog: (type, msg) => {
        const entry = { type, msg, time: timestamp() }
        set((s) => ({ funnelLog: [entry, ...s.funnelLog].slice(0, 50) }))
      },

      checkAlerts: () => {
        const { ly, total } = get().calcPortfolio()
        const { macro, positions } = get()
        if (total < 100) return
        const pp = (k) => pct(ly[k] || 0, total)
        if (pp('spec') > 15) get().addAlert('warn', 'L3 Overweight', `Speculative at ${pp('spec').toFixed(1)}% — max 15%. Harvest to Growth.`)
        if (pp('safe') < 35) get().addAlert('warn', 'L1 Underweight', `Safe Layer at ${pp('safe').toFixed(1)}% — below 35% minimum.`)
        if (macro.mrs > 7.5) get().addAlert('warn', 'Crisis Signal', `MRS ${macro.mrs.toFixed(1)}/10. Enter survival posture.`)
        if (macro.vix > 28) get().addAlert('warn', 'VIX Spike', `VIX at ${macro.vix.toFixed(1)}. Consider reducing L3.`)
        positions.forEach((p) => {
          if (p.ent && p.cur <= p.val * (1 - p.sl / 100))
            get().addAlert('warn', 'Stop-Loss Breached', `${p.sym} fell below ${p.sl}% stop-loss. Review exit.`)
        })
      },

      checkFunnelTriggers: () => {
        const { positions, cfg, cooldowns } = get()
        positions.forEach((p) => {
          const gainPct = ((p.cur - p.val) / p.val) * 100
          const key = 'harvest:' + p.id
          if (p.lyr === 'spec' && gainPct >= 40 && (!cooldowns[key] || Date.now() - cooldowns[key] > 3600000)) {
            const harvestAmt = (p.cur - p.val) * 0.5
            const netHarvest = harvestAmt * (1 - cfg.tax / 100)
            get().addAlert('gold', '⚡ Profit Lock Available', `${p.sym} +${gainPct.toFixed(1)}% — harvest ${fmtShort(netHarvest)} (post-${cfg.tax}% tax) to Growth?`, true)
            get().addFunnelLog('trigger', `HARVEST: ${p.sym} +${gainPct.toFixed(1)}% — ${fmtShort(netHarvest)} net`)
            set((s) => ({ cooldowns: { ...s.cooldowns, [key]: Date.now() } }))
          }
          const key2 = 'rotate:' + p.id
          if (p.lyr === 'growth' && gainPct >= 30 && (!cooldowns[key2] || Date.now() - cooldowns[key2] > 3600000)) {
            get().addAlert('info', 'L2 → L1 Rotation', `${p.sym} +${gainPct.toFixed(1)}% — rotate 25% gain to Safe Layer?`)
            get().addFunnelLog('trigger', `ROTATE: ${p.sym} +${gainPct.toFixed(1)}% → Safe Layer`)
            set((s) => ({ cooldowns: { ...s.cooldowns, [key2]: Date.now() } }))
          }
        })
      },

      setLastSync: (t) => set({ lastSync: t }),
      logout: () => set({ user: { name: '', email: '', tier: 'free', id: '' }, isDemo: false, positions: [], alerts: [], funnelLog: [] }),
    }),
    {
      name: 'apex-v3-store',
      partialize: (state) => ({
        user: state.user,
        positions: state.positions,
        alloc: state.alloc,
        cfg: state.cfg,
        macro: state.macro,
        regime: state.regime,
        alerts: state.alerts.slice(0, 60),
        funnelLog: state.funnelLog.slice(0, 30),
        isDemo: state.isDemo,
      }),
    }
  )
)

export default useApexStore
