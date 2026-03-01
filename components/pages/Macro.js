'use client'
import useApexStore, { clamp, fmtShort, pct } from '@/store/apexStore'
import { Card, CardHeader, AlertBox, Btn, SectionHeader, Badge } from '@/components/ui'
import { LAYER_COLORS, LAYER_NAMES } from '@/store/apexStore'

export default function MacroPage({ onSync }) {
  const { macro, setMacro, regime, positions, calcPortfolio, alloc } = useApexStore()
  const { ly, total } = calcPortfolio()

  const macroFields = [
    { k: 'rate', n: 'Interest Rates', unit: '%', lo: 0, hi: 10, step: 0.25, color: '#fbbf24' },
    { k: 'inf', n: 'Inflation (CPI)', unit: '%', lo: 0, hi: 15, step: 0.25, color: '#fbbf24' },
    { k: 'vix', n: 'Volatility (VIX)', unit: '', lo: 8, hi: 50, step: 0.5, color: '#f87171' },
    { k: 'spread', n: 'HY Credit Spread', unit: 'bps', lo: 100, hi: 900, step: 25, color: '#f97316' },
    { k: 'geo', n: 'Geopolitical Risk', unit: '/10', lo: 0, hi: 10, step: 0.5, color: '#f87171' },
    { k: 'mrs', n: 'Macro Risk Score', unit: '/10', lo: 0, hi: 10, step: 0.1, color: macro.mrs < 4 ? '#34d399' : macro.mrs < 7 ? '#fbbf24' : '#f87171', readonly: true },
  ]

  // Regime recommendations
  const recs = []
  if (macro.rate > 5.5) recs.push({ tp: 'warn', ico: '⚠', t: `High Rate (${macro.rate.toFixed(2)}%)`, b: 'Increase Safe to 55%. Short-duration Treasuries + TIPS. Trim L3.' })
  else if (macro.rate < 2.5) recs.push({ tp: 'info', ico: '◈', t: `Low Rate (${macro.rate.toFixed(2)}%)`, b: 'L2 Growth to 45%. REITs + dividend equity attractive for yield.' })
  else recs.push({ tp: 'ok', ico: '✓', t: 'Moderate Rate Regime', b: 'Standard allocations appropriate. Execute profit funnel on schedule.' })
  if (macro.inf > 5) recs.push({ tp: 'warn', ico: '⚠', t: `High Inflation (${macro.inf.toFixed(1)}%)`, b: 'Heavy TIPS + gold. Float-rate credit. Trim nominal bonds entirely.' })
  if (macro.vix > 28) recs.push({ tp: 'warn', ico: '⚠', t: `VIX Spike (${macro.vix.toFixed(1)})`, b: 'Elevated stress. Reduce L3 to minimum. Increase cash.' })
  if (macro.mrs > 7.5) recs.push({ tp: 'warn', ico: '🔴', t: 'CRISIS SIGNAL — Survival Mode', b: `MRS ${macro.mrs.toFixed(1)}/10. Safe Layer to max 59%. L3 to floor 5%.` })
  else if (macro.mrs < 3) recs.push({ tp: 'ok', ico: '✓', t: 'Expansion Phase', b: 'Low systemic risk. L3 can approach 15% upper bound. Full funnel cadence.' })

  // Rebalance
  const tgt = { safe: 45, growth: 40, spec: 10, cash: 5 }
  const acts = total > 0 ? Object.entries(tgt).map(([k, t]) => {
    const cur = pct(ly[k] || 0, total)
    const diff = cur - t
    return Math.abs(diff) < 2 ? null : { k, cur: cur.toFixed(1), t, diff: diff.toFixed(1), amt: fmtShort(Math.abs(diff / 100 * total)) }
  }).filter(Boolean) : []

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Macro Signal Engine"
        subtitle="6-signal MRS composite · Live data · Regime classification"
        right={<Btn variant="secondary" size="sm" onClick={onSync}>↺ Refresh</Btn>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[13px] mb-[13px]">
        {macroFields.map((m) => (
          <div key={m.k} className="bg-[#0f1326] border border-[#1a2035] rounded-xl p-[14px]">
            <div className="font-mono text-[9px] text-[#3d4a6b] uppercase tracking-[0.14em] mb-1">{m.n}</div>
            <div className="font-display text-[28px] font-bold italic leading-none mb-[9px]" style={{ color: m.color }}>
              {m.k === 'spread' ? Math.round(macro[m.k] || 0) : (macro[m.k] || 0).toFixed(m.unit === 'bps' ? 0 : m.unit === '/10' ? 1 : 2)}{m.unit}
            </div>
            {!m.readonly && (
              <input
                type="range" min={m.lo} max={m.hi} step={m.step} value={macro[m.k] || 0}
                onChange={(e) => setMacro({ [m.k]: parseFloat(e.target.value) })}
              />
            )}
            {m.readonly && (
              <div className="prog"><div className="pfill" style={{ width: clamp((macro.mrs / 10) * 100, 0, 100) + '%', background: m.color }} /></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        <Card>
          <CardHeader title="Regime Recommendations" />
          {recs.map((r, i) => <AlertBox key={i} type={r.tp} title={r.t} body={r.b} />)}
        </Card>

        <Card>
          <CardHeader
            title="Rebalance Actions"
            right={<Btn variant="primary" size="sm" onClick={() => {/* scan */ }}>Run Scan</Btn>}
          />
          {acts.length ? acts.map((a) => (
            <div key={a.k} className="flex justify-between items-center p-[8px_9px] bg-[#0c0f1f] rounded-[7px] mb-[5px]">
              <div>
                <div className="text-[11px] font-semibold" style={{ color: LAYER_COLORS[a.k] }}>{LAYER_NAMES[a.k]}</div>
                <div className="font-mono text-[9px] text-[#3d4a6b]">{parseFloat(a.diff) > 0 ? 'Reduce' : 'Increase'} {Math.abs(a.diff)}% — {a.amt}</div>
              </div>
              <Badge variant={parseFloat(a.diff) > 0 ? 'down' : 'up'}>{parseFloat(a.diff) > 0 ? 'Overweight' : 'Underweight'}</Badge>
            </div>
          )) : (
            <div className="p-[10px] bg-[#0c0f1f] rounded-lg text-[10px] text-[#34d399]">
              {total > 0 ? '✓ All layers within target bands. No action required.' : 'Add positions to see rebalance actions.'}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
