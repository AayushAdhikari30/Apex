'use client'
import useApexStore, { LAYER_COLORS, LAYER_NAMES, LAYER_TARGETS, pct, fmtShort, clamp } from '@/store/apexStore'
import { Card, CardHeader, KpiCard, AlertBox, ProgressBar, SectionHeader } from '@/components/ui'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { positions, alloc, cfg, macro, regime, alerts, funnelLog, calcPortfolio, calcHealthScore } = useApexStore()
  const { ly, total } = useMemo(() => calcPortfolio(), [positions])
  const hs = useMemo(() => calcHealthScore(), [positions, alerts])
  const hsColor = hs >= 80 ? '#34d399' : hs >= 60 ? '#fcd34d' : '#f87171'
  const pp = (k) => pct(ly[k] || 0, total)

  const cagr = (alloc.safe / 100 * cfg.rf / 100 + alloc.growth / 100 * 0.09 + alloc.spec / 100 * cfg.l3r / 100) * 100

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Portfolio Dashboard"
        subtitle={`Regime: ${regime.charAt(0).toUpperCase() + regime.slice(1)} · MRS ${macro.mrs?.toFixed(1)}/10 · ${positions.length} positions`}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[11px] mb-[13px]">
        <KpiCard title="Total Capital" value={fmtShort(total)} sub={total ? 'Live portfolio value' : 'Add positions to start'} />
        <KpiCard title="Safe (L1)" value={fmtShort(ly.safe || 0)} color="var(--safe)" sub={pp('safe').toFixed(1) + '% · target 35–55%'} />
        <KpiCard title="Growth (L2)" value={fmtShort(ly.growth || 0)} color="var(--growth)" sub={pp('growth').toFixed(1) + '% · target 25–45%'} />
        <KpiCard title="Speculative (L3)" value={fmtShort(ly.spec || 0)} color="var(--spec)" sub={pp('spec').toFixed(1) + '% · target 5–15%'} />
        <KpiCard title="Blended CAGR" value={cagr.toFixed(2) + '%'} color="#7390fa" sub="Gross · pre-tax estimate" />
        <KpiCard title="Health Score" value={hs || '—'} color={hsColor} sub={hs >= 80 ? 'Excellent' : hs >= 60 ? 'Good · Minor gaps' : hs ? 'Needs attention' : 'Computing...'} />
      </div>

      {/* Allocation + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px] mb-[13px]">
        {/* Allocation Donut */}
        <Card glow>
          <CardHeader title="Allocation Map" right={<span className="font-mono text-[9px] text-[#3d4a6b]">{positions.length} position{positions.length !== 1 ? 's' : ''}</span>} />
          <div className="flex gap-[14px] items-center">
            <DonutChart ly={ly} total={total} />
            <div className="flex-1">
              {Object.entries(LAYER_NAMES).map(([k, n]) => (
                <div key={k} className="flex items-center gap-[6px] mb-[7px]">
                  <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: LAYER_COLORS[k], boxShadow: `0 0 5px ${LAYER_COLORS[k]}60` }} />
                  <span className="text-[10px] text-[#8892b0]">{n}</span>
                  <span className="ml-auto font-mono text-[10px]" style={{ color: LAYER_COLORS[k] }}>{pp(k).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Health Score */}
        <Card>
          <CardHeader title="Health Score" right={<span className="text-[9px] text-[#3d4a6b]">Regime: {regime.charAt(0).toUpperCase() + regime.slice(1)}</span>} />
          <div className="flex gap-[14px] items-center mb-3">
            <HealthRing score={hs} color={hsColor} />
            <div className="flex-1">
              {[
                { n: 'Layer Compliance', v: hs >= 70 ? 92 : hs >= 50 ? 68 : 38 },
                { n: 'Regime Alignment', v: clamp(100 - Math.abs(macro.mrs - 5) * 9, 20, 100) },
                { n: 'Stop-Loss Health', v: positions.every((p) => !p.ent || p.cur > p.val * (1 - p.sl / 100)) ? 100 : 55 },
                { n: 'Rotation Discipline', v: funnelLog.length > 0 ? 88 : 70 },
              ].map((d) => {
                const dc = d.v >= 80 ? '#34d399' : d.v >= 60 ? '#fcd34d' : '#f87171'
                return (
                  <div key={d.n} className="mb-[6px]">
                    <div className="flex justify-between mb-[2px]">
                      <span className="text-[10px] text-[#8892b0]">{d.n}</span>
                      <span className="font-mono text-[10px]" style={{ color: dc }}>{Math.round(clamp(d.v, 0, 100))}</span>
                    </div>
                    <ProgressBar value={clamp(d.v, 0, 100)} color={dc} />
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
        {/* Recent Alerts */}
        <Card>
          <CardHeader title="Recent Alerts" />
          {alerts.slice(0, 3).length ? (
            alerts.slice(0, 3).map((a) => <AlertBox key={a.id} {...a} />)
          ) : (
            <div className="text-[11px] text-[#3d4a6b] py-[6px]">No alerts · All systems nominal ✓</div>
          )}
        </Card>

        {/* Layer Health */}
        <Card>
          <CardHeader title="Layer Health" />
          {Object.entries(LAYER_TARGETS).map(([k, [lo, hi]]) => {
            const v = pp(k)
            const warn = total > 0 && (v < lo - 2 || v > hi + 2)
            return (
              <div key={k} className="mb-[9px]">
                <div className="flex justify-between mb-[2px]">
                  <span className="text-[10px]" style={{ color: LAYER_COLORS[k] }}>{LAYER_NAMES[k]}</span>
                  <span className="font-mono text-[9px]" style={{ color: warn ? '#f87171' : total ? '#34d399' : '#3d4a6b' }}>
                    {v.toFixed(1)}% {total ? (warn ? '⚠' : '✓') : ''}
                  </span>
                </div>
                <ProgressBar value={clamp(v, 0, 100)} color={LAYER_COLORS[k]} />
                <div className="font-mono text-[8px] text-[#3d4a6b] mt-[2px]">Target {lo}–{hi}%</div>
              </div>
            )
          })}
        </Card>

        {/* Macro Signals */}
        <Card>
          <CardHeader title="Macro Signals" right={<span className="text-[9px] text-[#34d399]">● Live</span>} />
          {[
            { n: 'Rates', v: macro.rate?.toFixed(2) + '%', r: (macro.rate || 0) / 8, c: '#fbbf24' },
            { n: 'VIX', v: (macro.vix || 0).toFixed(1), r: (macro.vix || 0) / 50, c: '#f87171' },
            { n: 'Inflation', v: (macro.inf || 0).toFixed(1) + '%', r: (macro.inf || 0) / 12, c: '#fbbf24' },
            { n: 'MRS', v: (macro.mrs || 0).toFixed(1) + '/10', r: (macro.mrs || 0) / 10, c: macro.mrs < 4 ? '#34d399' : macro.mrs < 7 ? '#fbbf24' : '#f87171' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-[7px] mb-[6px]">
              <span className="font-mono text-[9px] text-[#3d4a6b] w-[54px] flex-shrink-0">{s.n}</span>
              <div className="flex-1"><ProgressBar value={clamp(s.r * 100, 0, 100)} color={s.c} /></div>
              <span className="font-mono text-[9px] w-[38px] text-right" style={{ color: s.c }}>{s.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── Donut Chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ ly, total }) {
  const circ = 339
  const keys = ['safe', 'growth', 'spec', 'cash']
  let offset = 0
  const slices = keys.map((k) => {
    const fraction = total > 0 ? (ly[k] || 0) / total : 0
    const len = fraction * circ
    const slice = { k, len, offset, color: LAYER_COLORS[k] }
    offset += len
    return slice
  })

  return (
    <div className="relative flex-shrink-0 w-[140px] h-[140px]">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r="54" fill="none" stroke="#1a2035" strokeWidth="20" />
        {slices.map((s) => (
          <circle
            key={s.k}
            cx="70" cy="70" r="54" fill="none"
            stroke={s.color} strokeWidth="20"
            strokeDasharray={`${s.len.toFixed(2)} ${(circ - s.len).toFixed(2)}`}
            strokeDashoffset={(-s.offset).toFixed(2)}
            style={{ transition: 'all 0.8s ease' }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-[14px] font-bold italic leading-none">{fmtShort(total)}</div>
        <div className="font-mono text-[8px] text-[#3d4a6b] tracking-[0.1em] mt-[1px]">TOTAL</div>
      </div>
    </div>
  )
}

// ── Health Ring ───────────────────────────────────────────────────────────────
function HealthRing({ score, color }) {
  const offset = 289 - (289 * (score || 0)) / 100
  return (
    <div className="relative w-[110px] h-[110px] flex-shrink-0 flex items-center justify-center">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="46" fill="none" stroke="#1a2035" strokeWidth="7" />
        <circle
          cx="55" cy="55" r="46" fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray="289"
          style={{ strokeDashoffset: offset, transform: 'rotate(-90deg)', transformOrigin: '55px 55px', transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-[28px] font-bold italic leading-none" style={{ color }}>{score || '—'}</div>
        <div className="font-mono text-[8px] text-[#3d4a6b] tracking-[0.1em] mt-[1px]">SCORE</div>
      </div>
    </div>
  )
}
