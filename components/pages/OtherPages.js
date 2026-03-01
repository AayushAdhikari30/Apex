'use client'
// ─────────────────────────────────────────────────────────────────────────────
// All remaining pages: Funnel · Stress · Monte Carlo · Tax · Milestones
//                      Alerts · Settings
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef, useEffect, useState } from 'react'
import useApexStore, {
  LAYER_COLORS, LAYER_NAMES, STRESS_SCENARIOS, MILESTONES,
  pct, fmt, fmtShort, fmtPct, clamp
} from '@/store/apexStore'
import { Card, CardHeader, AlertBox, Btn, SectionHeader, MetricRow, KpiCard, ProgressBar, LiveDot, Toggle } from '@/components/ui'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, CartesianGrid
} from 'recharts'

// ── Profit Funnel ─────────────────────────────────────────────────────────────
export function FunnelPage() {
  const { funnelLog, cfg, macro, calcPortfolio, positions } = useApexStore()
  const { ly } = useMemo(() => calcPortfolio(), [positions])
  const nodes = [
    { k: 'spec', rule: '+40% → harvest 50% → Growth (post-tax)' },
    { k: 'growth', rule: '+30% → rotate 25% → Safe' },
    { k: 'safe', rule: 'Compound · protect · 12–24mo runway' },
    { k: 'cash', rule: `Deploy at MRS ≥ 7.5 (current: ${macro.mrs?.toFixed(1)})` },
  ]
  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="font-display text-[20px] font-bold italic">Profit Funnel</div>
          <div className="font-mono text-[10px] text-[#3d4a6b]">Tax-adjusted mechanical rotation · Spec → Growth → Safe → Cash</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#34d399]"><LiveDot />Active</div>
      </div>

      {/* Flow */}
      <Card className="mb-[13px]">
        <CardHeader title="Live Flow" />
        <div className="flex items-center overflow-x-auto gap-0 py-1">
          {nodes.map((n, i) => (
            <div key={n.k} className="flex items-center flex-shrink-0">
              {i > 0 && <div className="text-base px-[5px] text-[#3d4a6b]">→</div>}
              <div className="min-w-[120px] p-[13px] bg-[#0c0f1f] rounded-[9px] border" style={{ borderColor: LAYER_COLORS[n.k] + '44' }}>
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] mb-1" style={{ color: LAYER_COLORS[n.k] }}>{LAYER_NAMES[n.k]}</div>
                <div className="font-display text-xl font-bold italic mb-1" style={{ color: LAYER_COLORS[n.k] }}>{fmtShort(ly[n.k] || 0)}</div>
                <div className="text-[9px] text-[#3d4a6b] leading-[1.4]">{n.rule}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        <Card>
          <CardHeader title="Rotation Rules" />
          {[
            { tp: 'gold', t: 'L3 Harvest (Post-Tax)', b: `+40% → harvest 50% of gain to Growth (L2). At ${cfg.tax}% bracket, net factor = ${(1 - cfg.tax / 100).toFixed(2)}×.` },
            { tp: 'info', t: 'L2 → L1 Rotation', b: 'Growth +30% or L2 > 45% → rotate 25% gain to Safe. Locks compounding permanently.' },
            { tp: 'ok', t: 'Cash Deployment', b: `Reserve deployed when MRS ≥ 7.5. Current: ${macro.mrs?.toFixed(1)}. ${macro.mrs >= 7.5 ? '⚡ DEPLOY NOW' : '● Hold powder'}` },
            { tp: 'warn', t: 'Stop-Loss Protocol', b: 'Stop breach halts funnel for that asset. System is mechanical — emotion excluded.' },
          ].map((r) => <AlertBox key={r.t} type={r.tp} title={r.t} body={r.b} />)}
        </Card>

        <Card>
          <CardHeader title="Activity Log" right={<Btn variant="secondary" size="sm" onClick={() => useApexStore.setState({ funnelLog: [] })}>Clear</Btn>} />
          <div className="max-h-[300px] overflow-y-auto">
            {funnelLog.length ? funnelLog.map((l, i) => (
              <div key={i} className="flex gap-[7px] py-[5px] border-b border-[#1a2035]">
                <span className="font-mono text-[9px] text-[#3d4a6b] flex-shrink-0 pt-[1px]">{l.time}</span>
                <span className="text-[10px]" style={{ color: l.type === 'trigger' ? '#fcd34d' : l.type === 'warn' ? '#f87171' : '#8892b0' }}>{l.msg}</span>
              </div>
            )) : <div className="text-[10px] text-[#3d4a6b] py-2">Events appear here as triggers fire.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Stress Tests ──────────────────────────────────────────────────────────────
export function StressPage() {
  const { calcPortfolio, positions } = useApexStore()
  const { total } = useMemo(() => calcPortfolio(), [positions])
  const [selScen, setSelScen] = useState(null)

  const runStress = (s) => setSelScen(s)

  const lcgsDd = selScen ? selScen.dd * 0.35 : 0
  const p6040Dd = selScen ? selScen.dd * 0.6 : 0
  const spDd = selScen ? selScen.dd : 0

  const pathData = useMemo(() => {
    if (!selScen) return []
    const T = 24
    const genPath = (dd, recMo) => {
      const crash = 4
      const p = []
      for (let i = 0; i < crash; i++) p.push(+(1 - dd / 100 * (i + 1) / crash).toFixed(3))
      for (let i = 0; i < recMo && p.length < T; i++) p.push(+Math.min(1, (1 - dd / 100) * (1 + (i + 1) / recMo * (dd / 100 + 0.05))).toFixed(3))
      while (p.length < T) p.push(+(1.02 + Math.random() * 0.02).toFixed(3))
      return p
    }
    const p1 = genPath(lcgsDd, Math.round(selScen.dur * 0.45))
    const p2 = genPath(p6040Dd, Math.round(selScen.dur * 0.7))
    const p3 = genPath(spDd, selScen.dur)
    return Array.from({ length: 24 }, (_, i) => ({ i, lcgs: p1[i], p6040: p2[i], sp500: p3[i] }))
  }, [selScen])

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Stress Test Suite" subtitle="6 historical scenarios · Portfolio-level impact · LCGS advantage" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[13px] mb-[13px]">
        {STRESS_SCENARIOS.map((s) => (
          <div
            key={s.id}
            className={`bg-[#0f1326] border border-[#1a2035] rounded-xl p-[14px] cursor-pointer transition-all border-l-[3px] hover:-translate-y-[2px] ${selScen?.id === s.id ? 'border-[#4f6ef7] bg-[rgba(79,110,247,0.06)]' : ''}`}
            style={{ borderLeftColor: s.color }}
            onClick={() => runStress(s)}
          >
            <div className="text-xl mb-[6px]">{s.icon}</div>
            <div className="font-display text-[13px] font-bold italic mb-1" style={{ color: s.color }}>{s.name}</div>
            <div className="text-[10px] text-[#8892b0] leading-[1.4] mb-[9px]">{s.desc}</div>
            <div className="flex gap-[6px] flex-wrap">
              <span className="bg-[rgba(239,68,68,0.14)] text-[#f87171] font-mono text-[10px] font-semibold px-[7px] py-[2px] rounded">Peak −{s.dd}%</span>
              <span className="bg-[rgba(79,110,247,0.14)] text-[#7390fa] font-mono text-[10px] font-semibold px-[7px] py-[2px] rounded">{s.dur}mo recovery</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        <Card>
          <CardHeader title="Impact Analysis" />
          {!selScen ? (
            <div className="text-[10px] text-[#3d4a6b] py-2">Click a scenario above to stress-test your portfolio.</div>
          ) : (
            <>
              <div className="mb-[10px] p-[10px_12px] bg-[#0c0f1f] rounded-lg border-l-[3px]" style={{ borderColor: selScen.color }}>
                <div className="text-xs font-semibold mb-1" style={{ color: selScen.color }}>{selScen.icon} {selScen.name}</div>
                <div className="text-[10px] text-[#8892b0]">{selScen.desc}</div>
              </div>
              {[
                { l: 'LCGS Portfolio', dd: lcgsDd, color: '#34d399' },
                { l: '60/40 Portfolio', dd: p6040Dd, color: '#60a5fa' },
                { l: '100% Equity (S&P)', dd: spDd, color: '#f87171' },
              ].map((r) => (
                <div key={r.l} className="mb-[8px]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-semibold" style={{ color: r.color }}>{r.l}</span>
                    <span className="font-mono text-[10px] text-[#f87171]">−{r.dd.toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={100 - r.dd} height={7} color={r.color} />
                  <div className="flex justify-between mt-1 font-mono text-[9px] text-[#3d4a6b]">
                    <span>Floor: {fmtShort(total * (1 - r.dd / 100))}</span>
                    <span>+{((1 / (1 - r.dd / 100) - 1) * 100).toFixed(1)}% to recover</span>
                  </div>
                </div>
              ))}
              <div className="mt-[10px] p-[9px_10px] bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.2)] rounded-[7px] text-[10px] text-[#34d399]">
                <strong>LCGS Advantage:</strong> {(spDd - lcgsDd).toFixed(1)}% lower drawdown = {(((1 / (1 - spDd / 100) - 1) - (1 / (1 - lcgsDd / 100) - 1)) * 100).toFixed(1)}% less recovery required.
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader title="Recovery Path Comparison" />
          {selScen && pathData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={pathData} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
                <XAxis dataKey="i" tick={{ fontSize: 9, fill: '#3d4a6b' }} label={{ value: 'months', position: 'insideBottom', fill: '#3d4a6b', fontSize: 9 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#3d4a6b', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => (v * 100).toFixed(0) + '%'} />
                <Tooltip contentStyle={{ background: '#0f1326', border: '1px solid #1a2035', borderRadius: 6, fontSize: 10 }} formatter={(v, n) => [(v * 100).toFixed(1) + '%', n]} />
                <ReferenceLine y={1} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="lcgs" stroke="#34d399" strokeWidth={2} dot={false} name="LCGS" />
                <Line type="monotone" dataKey="p6040" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="60/40" />
                <Line type="monotone" dataKey="sp500" stroke="#f87171" strokeWidth={1.5} dot={false} name="S&P 500" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[10px] text-[#3d4a6b]">Select a scenario to view recovery paths</div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── Monte Carlo ───────────────────────────────────────────────────────────────
function normalRnd() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function MonteCarloPage() {
  const { cfg, alloc, positions, calcPortfolio } = useApexStore()
  const { total } = useMemo(() => calcPortfolio(), [positions])
  const C = total || cfg.C
  const mu = alloc.safe / 100 * cfg.rf / 100 + alloc.growth / 100 * 0.09 + alloc.spec / 100 * cfg.l3r / 100
  const sigma = cfg.vol / 100 * 0.6
  const T = 10
  const N = 1000

  const { finalVals, chartData } = useMemo(() => {
    const finals = []
    const paths = []
    for (let n = 0; n < N; n++) {
      const path = [C]
      let v = C
      for (let t = 0; t < T; t++) {
        v = Math.max(0, v * (1 + mu + sigma * normalRnd()))
        path.push(v)
      }
      finals.push(v)
      if (n < 100) paths.push(path)
    }
    finals.sort((a, b) => a - b)

    const cd = Array.from({ length: T + 1 }, (_, yr) => {
      const yrVals = paths.map((p) => p[yr] || p[p.length - 1]).sort((a, b) => a - b)
      return {
        yr,
        p5: yrVals[Math.floor(yrVals.length * 0.05)],
        p25: yrVals[Math.floor(yrVals.length * 0.25)],
        p50: yrVals[Math.floor(yrVals.length * 0.5)],
        p75: yrVals[Math.floor(yrVals.length * 0.75)],
        p95: yrVals[Math.floor(yrVals.length * 0.95)],
      }
    })
    return { finalVals: finals, chartData: cd }
  }, [C, mu, sigma])

  const gp = (p) => finalVals[Math.floor(p / 100 * N)] || 0
  const ruin = finalVals.filter((v) => v < C * 0.5).length / N * 100
  const triple = finalVals.filter((v) => v > C * 3).length / N * 100
  const cagr50 = Math.pow(gp(50) / Math.max(C, 1), 1 / T) - 1

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Monte Carlo Simulation"
        subtitle="1,000 paths · Sequence-of-returns risk · 10-year projection"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[11px] mb-[13px]">
        <KpiCard title="5th Percentile" value={fmt(gp(5))} color="#f87171" sub="Worst 5% of paths" />
        <KpiCard title="25th Percentile" value={fmt(gp(25))} color="#fbbf24" sub="Adverse scenario" />
        <KpiCard title="Median (50th)" value={fmt(gp(50))} color="#7390fa" sub="Central estimate" />
        <KpiCard title="95th Percentile" value={fmt(gp(95))} color="#34d399" sub="Best 5% of paths" />
      </div>

      <Card className="mb-[13px]">
        <CardHeader
          title="Path Distribution (10yr)"
          right={
            <div className="flex gap-3 font-mono text-[9px]">
              <span style={{ color: '#34d399' }}>— 95th</span>
              <span style={{ color: '#7390fa' }}>— Median</span>
              <span style={{ color: '#f87171' }}>— 5th</span>
            </div>
          }
        />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id="grad95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="yr" tick={{ fontSize: 9, fill: '#3d4a6b' }} label={{ value: 'Years', position: 'insideBottom', fill: '#3d4a6b', fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9, fill: '#3d4a6b', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => '$' + Math.round(v / 1000) + 'K'} />
            <Tooltip contentStyle={{ background: '#0f1326', border: '1px solid #1a2035', borderRadius: 6, fontSize: 10 }} formatter={(v) => ['$' + Math.round(v).toLocaleString()]} />
            <Area type="monotone" dataKey="p95" stroke="#34d399" strokeWidth={1.5} fill="url(#grad95)" dot={false} />
            <Line type="monotone" dataKey="p50" stroke="#7390fa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p5" stroke="#f87171" strokeWidth={1.5} dot={false} />
            <ReferenceLine y={C} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" label={{ value: 'Start', fill: '#3d4a6b', fontSize: 9 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
        <KpiCard title="Ruin Rate" value={ruin.toFixed(1) + '%'} color={ruin < 5 ? '#34d399' : ruin < 15 ? '#fbbf24' : '#f87171'} sub="Paths ending < 50% of start" />
        <KpiCard title="3× Probability" value={triple.toFixed(1) + '%'} color="#7390fa" sub="Paths exceeding 3× capital" />
        <KpiCard title="Median CAGR" value={(cagr50 * 100).toFixed(2) + '%'} color="#34d399" sub="50th percentile annualised" />
      </div>
    </div>
  )
}

// ── Tax Engine ────────────────────────────────────────────────────────────────
export function TaxPage() {
  const { cfg, alloc, positions, calcPortfolio } = useApexStore()
  const { ly, total } = useMemo(() => calcPortfolio(), [positions])
  const taxRate = cfg.tax / 100, rf = cfg.rf / 100, l3r = cfg.l3r / 100
  const grossL2 = 0.09
  const ptL1 = rf * (1 - taxRate)
  const ptL2 = rf + (grossL2 - rf) * (1 - taxRate)
  const ptL3 = rf + (l3r - rf) * (1 - taxRate)
  const harvest40 = total * alloc.spec / 100 * 0.4
  const netHarvest = harvest40 * (1 - taxRate)
  const taxDrag = harvest40 * taxRate
  const blendGross = alloc.safe / 100 * rf + alloc.growth / 100 * grossL2 + alloc.spec / 100 * l3r
  const blendPT = rf + (blendGross - rf) * (1 - taxRate)
  const losers = positions.filter((p) => p.ent && p.cur < p.val)

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Tax Engine" subtitle="Post-tax CAGR · Bracket-aware rotation · Tax-loss harvesting" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[11px] mb-[13px]">
        <KpiCard title="Post-Tax CAGR" value={(blendPT * 100).toFixed(2) + '%'} color="#34d399" sub="Blended after capital gains" />
        <KpiCard title="Gross CAGR" value={(blendGross * 100).toFixed(2) + '%'} color="#7390fa" sub="Before tax drag" />
        <KpiCard title="Tax Bracket" value={cfg.tax + '%'} color="#fcd34d" sub="Current setting" />
        <KpiCard title="Harvest Tax Impact" value={fmtShort(taxDrag)} color="#f87171" sub={`On +40% L3 trigger (${fmtShort(harvest40)} gross)`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        <Card>
          <CardHeader title="Post-Tax Profit Funnel" />
          {[
            { l: 'L3 Gross Gain (+40%)', v: fmtShort(harvest40), c: '#f97316' },
            { l: `Tax (${cfg.tax}% bracket)`, v: `−${fmtShort(taxDrag)}`, c: '#f87171' },
            { l: 'Net to Growth Layer', v: fmtShort(netHarvest), c: '#34d399' },
            { l: 'L2 Post-Tax CAGR', v: (ptL2 * 100).toFixed(2) + '%', c: '#4f6ef7' },
            { l: 'L1 Post-Tax Yield', v: (ptL1 * 100).toFixed(2) + '%', c: '#10b981' },
            { l: 'Blended Post-Tax CAGR', v: (blendPT * 100).toFixed(2) + '%', c: '#7390fa' },
          ].map((r) => <MetricRow key={r.l} label={r.l} value={r.v} color={r.c} />)}
        </Card>
        <Card>
          <CardHeader title="Tax-Loss Harvesting" />
          {losers.length ? losers.map((p) => {
            const loss = p.cur - p.val
            const taxSave = Math.abs(loss) * taxRate
            return (
              <div key={p.id} className="p-[9px_10px] bg-[#0c0f1f] rounded-[7px] mb-[6px]">
                <div className="flex justify-between">
                  <span className="text-[11px] font-semibold text-[#f87171]">{p.sym}</span>
                  <span className="font-mono text-[10px] text-[#f87171]">{fmtPct((p.cur - p.val) / p.val * 100)}</span>
                </div>
                <div className="font-mono text-[9px] text-[#3d4a6b]">Loss: {fmtShort(loss)} · Tax saving: {fmtShort(taxSave)}</div>
              </div>
            )
          }) : (
            <div className="p-[10px] bg-[#0c0f1f] rounded-lg text-[10px] text-[#34d399]">✓ No tax-loss opportunities. All positions in profit.</div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── Milestones ────────────────────────────────────────────────────────────────
export function MilestonesPage() {
  const { alloc, cfg, positions, calcPortfolio } = useApexStore()
  const { total } = useMemo(() => calcPortfolio(), [positions])
  const mu = alloc.safe / 100 * cfg.rf / 100 + alloc.growth / 100 * 0.09 + alloc.spec / 100 * cfg.l3r / 100

  const yrToReach = (target) => {
    if (total >= target) return 0
    if (mu <= 0) return Infinity
    return Math.ceil(Math.log(target / Math.max(1, total)) / Math.log(1 + mu))
  }

  const projData = Array.from({ length: 21 }, (_, i) => ({
    yr: i,
    value: Math.max(1, total) * Math.pow(1 + mu, i),
  }))

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Wealth Milestones" subtitle="Track your compounding journey · Celebrate each threshold" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        <div>
          {MILESTONES.map((m) => {
            const done = total >= m.value
            const yr = yrToReach(m.value)
            const progress = Math.min(100, pct(total, m.value))
            return (
              <Card key={m.value} className={`mb-[9px] ${done ? 'border-[rgba(240,180,41,0.4)] bg-[rgba(240,180,41,0.04)]' : ''}`}>
                <div className="flex items-center gap-[11px]">
                  <div className="text-[22px]">{m.icon}</div>
                  <div className="flex-1">
                    <div className="font-display text-base font-bold italic leading-none mb-[1px]" style={{ color: done ? '#fcd34d' : '#e2e8f0' }}>{m.label}</div>
                    <div className="font-mono text-[11px] text-[#3d4a6b]">
                      {fmt(m.value)} {done ? '✓ Achieved' : total > 0 ? `→ ${yr}yr at current CAGR` : 'Add positions to project'}
                    </div>
                  </div>
                  {done ? (
                    <span className="bg-[rgba(240,180,41,0.14)] text-[#fcd34d] font-mono text-[10px] font-semibold px-[7px] py-[2px] rounded">Done</span>
                  ) : total > 0 ? (
                    <span className="font-mono text-[10px] text-[#7390fa]">{progress.toFixed(1)}%</span>
                  ) : null}
                </div>
                {!done && total > 0 && <ProgressBar value={progress} color="#4f6ef7" className="mt-[9px]" />}
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader title="20-Year Projection" />
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="yr" tick={{ fontSize: 9, fill: '#3d4a6b' }} label={{ value: 'Years', position: 'insideBottom', fill: '#3d4a6b', fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9, fill: '#3d4a6b', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + Math.round(v / 1000) + 'K'} />
              <Tooltip contentStyle={{ background: '#0f1326', border: '1px solid #1a2035', borderRadius: 6, fontSize: 10 }} formatter={(v) => ['$' + Math.round(v).toLocaleString()]} />
              {MILESTONES.map((m) => m.value < projData[20]?.value * 1.2 && (
                <ReferenceLine key={m.value} y={m.value} stroke="rgba(240,180,41,0.2)" strokeDasharray="2 3" label={{ value: m.label, fill: 'rgba(240,180,41,0.5)', fontSize: 8 }} />
              ))}
              <Area type="monotone" dataKey="value" stroke="#4f6ef7" strokeWidth={2} fill="url(#projGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {total > 0 && (
            <div className="flex gap-[10px] flex-wrap font-mono text-[10px] text-[#3d4a6b] mt-2">
              {[1, 3, 5, 10, 20].map((y) => (
                <span key={y}>+{y}yr: <strong className="text-[#7390fa]">{fmtShort(total * Math.pow(1 + mu, y))}</strong></span>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── Alerts ────────────────────────────────────────────────────────────────────
export function AlertsPage() {
  const { alerts, clearAlerts } = useApexStore()
  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Alert Centre"
        subtitle={`${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`}
        right={<Btn variant="secondary" size="sm" onClick={clearAlerts}>Clear All</Btn>}
      />
      <Card>
        {alerts.length ? alerts.map((a) => <AlertBox key={a.id} {...a} />) : (
          <div className="text-[11px] text-[#3d4a6b] py-[16px] text-center">No alerts. All systems clear. ✓</div>
        )}
      </Card>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function SettingsPage({ onLogout }) {
  const { user, positions, alerts, cfg, setCfg } = useApexStore()
  const [notif, setNotif] = useState({ harvest: true, regime: true, stop: true })

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Settings" subtitle="Account · Notifications · Data · Plans" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        <div className="flex flex-col gap-[13px]">
          {/* Account */}
          <Card>
            <CardHeader title="Account" />
            <MetricRow label="Name" value={user.name} />
            <MetricRow label="Email" value={user.email} color="#3d4a6b" />
            <MetricRow label="Plan" value={<span className={`font-mono text-[10px] font-semibold px-[7px] py-[2px] rounded ${user.tier === 'pro' ? 'bg-[rgba(240,180,41,0.14)] text-[#fcd34d]' : 'bg-[rgba(148,163,184,0.1)] text-[#8892b0]'}`}>{(user.tier || 'free').toUpperCase()}</span>} />
            <MetricRow label="Positions" value={positions.length} />
            <MetricRow label="Alerts" value={alerts.length} bordered={false} />
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader title="Notifications" />
            {[{ k: 'harvest', l: 'Profit Harvest Alerts' }, { k: 'regime', l: 'Regime Change Alerts' }, { k: 'stop', l: 'Stop-Loss Breach Alerts' }].map((n) => (
              <div key={n.k} className="flex justify-between items-center py-2 border-b border-[#1a2035] last:border-0">
                <span className="text-xs text-[#8892b0]">{n.l}</span>
                <Toggle checked={notif[n.k]} onChange={(v) => setNotif((f) => ({ ...f, [n.k]: v }))} />
              </div>
            ))}
          </Card>

          {/* Data */}
          <Card>
            <CardHeader title="Data Connections" />
            {[
              { n: 'CoinGecko API', s: 'BTC/ETH live prices', st: 'Connected', c: '#34d399' },
              { n: 'ExchangeRate API', s: 'Gold (XAU) price', st: 'Connected', c: '#34d399' },
              { n: 'Macro Signals', s: 'VIX/Rates (simulated)', st: 'Simulated', c: '#fcd34d' },
            ].map((d) => (
              <div key={d.n} className="flex justify-between py-2 border-b border-[#1a2035] last:border-0">
                <div>
                  <div className="text-[11px]">{d.n}</div>
                  <div className="font-mono text-[9px] text-[#3d4a6b]">{d.s}</div>
                </div>
                <span className="font-mono text-[10px]" style={{ color: d.c }}>{d.st}</span>
              </div>
            ))}
          </Card>
        </div>

        <div className="flex flex-col gap-[13px]">
          {/* Plans */}
          <Card>
            <CardHeader title="Plans" />
            {[
              { n: 'Free', p: '$0', f: '5 positions · Basic alerts · Manual sync', t: 'free' },
              { n: 'Pro', p: '$29/mo', f: 'Unlimited positions · All modules · Auto-sync', t: 'pro' },
              { n: 'Expert', p: '$99/mo', f: 'Everything in Pro · Tax engine · API access', t: 'expert' },
            ].map((pl) => (
              <div key={pl.t} className={`bg-[#0c0f1f] border border-[#1a2035] rounded-[10px] p-4 transition-all mb-2 ${user.tier === pl.t ? 'border-[rgba(240,180,41,0.4)] bg-[rgba(240,180,41,0.05)]' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="text-[13px] font-bold" style={{ color: user.tier === pl.t ? '#fcd34d' : '#e2e8f0' }}>{pl.n}</div>
                  <div className="font-display text-xl italic font-bold text-[#fcd34d]">{pl.p}</div>
                </div>
                <div className="text-[10px] text-[#3d4a6b] mt-1">{pl.f}</div>
                {user.tier !== pl.t ? (
                  <Btn variant="secondary" size="sm" className="mt-[9px] w-full" onClick={() => alert('Connect Stripe for production billing.')}>Upgrade to {pl.n}</Btn>
                ) : (
                  <div className="mt-2 text-[10px] text-[#fcd34d]">✓ Current plan</div>
                )}
              </div>
            ))}
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader title="Danger Zone" />
            <div className="flex flex-col gap-2">
              <Btn variant="secondary" onClick={() => { if (confirm('Reset all portfolio data?')) { useApexStore.setState({ positions: [], alerts: [], funnelLog: [] }) } }}>Reset Portfolio Data</Btn>
              <Btn variant="danger" onClick={onLogout}>Sign Out</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
