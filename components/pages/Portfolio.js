'use client'
import useApexStore, { LAYER_COLORS, LAYER_NAMES, RISK_PROFILES, fmtShort, clamp } from '@/store/apexStore'
import { Card, CardHeader, FormGroup, Input, Select, SectionHeader, MetricRow, ProgressBar } from '@/components/ui'

export default function PortfolioPage() {
  const { cfg, alloc, markov, regime, setCfg, setAlloc, applyProfile, calcPortfolio } = useApexStore()

  const mu = cfg.l3r / 100
  const rf = cfg.rf / 100
  const sigma = cfg.vol / 100
  const taxRate = cfg.tax / 100
  const kellyFull = Math.max(0, (mu - rf) / (sigma * sigma))
  const kellyEff = clamp(kellyFull * cfg.kel, 0, 1)
  const grossBlend = alloc.safe / 100 * rf + alloc.growth / 100 * 0.09 + alloc.spec / 100 * mu
  const ptBlend = rf + (grossBlend - rf) * (1 - taxRate)
  const cushion = cfg.C * (1 - cfg.floor / 100)

  const layers = [
    { k: 'safe', n: 'Safe (L1)', gross: cfg.rf, role: 'Protection / Floor' },
    { k: 'growth', n: 'Growth (L2)', gross: 9, role: 'Compounding engine' },
    { k: 'spec', n: 'Speculative (L3)', gross: cfg.l3r, role: 'Convex upside' },
    { k: 'cash', n: 'Cash Reserve', gross: cfg.rf, role: 'Dry powder' },
  ]

  const regimeColors = { expansion: 'var(--safe)', transition: 'var(--gold)', contraction: 'var(--spec)', crisis: 'var(--r)' }

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Portfolio Engine" subtitle="Markov-weighted allocation · LCGS three-layer framework · CPPI protection" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px] mb-[13px]">
        {/* Config */}
        <Card>
          <CardHeader title="Capital Configuration" />
          <FormGroup label="Total Capital (USD)">
            <Input type="number" value={cfg.C} onChange={(e) => setCfg({ C: parseFloat(e.target.value) || cfg.C })} />
          </FormGroup>
          <div className="grid grid-cols-2 gap-[10px]">
            <FormGroup label="Risk Profile">
              <Select value={cfg.prof} onChange={(e) => applyProfile(e.target.value)}>
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="growth">Growth</option>
                <option value="aggressive">Aggressive</option>
              </Select>
            </FormGroup>
            <FormGroup label="Kelly Mode">
              <Select value={cfg.kel} onChange={(e) => setCfg({ kel: parseFloat(e.target.value) })}>
                <option value="1">Full Kelly</option>
                <option value="0.5">½ Kelly ★</option>
                <option value="0.25">¼ Kelly</option>
                <option value="0.1">⅒ Kelly</option>
              </Select>
            </FormGroup>
          </div>

          <RangeField label="L3 Expected Return" value={cfg.l3r} min={5} max={35} color="#f97316" unit="%" onChange={(v) => setCfg({ l3r: v })} />
          <RangeField label="Annualised Volatility σ" value={cfg.vol} min={5} max={65} color="#fcd34d" unit="%" onChange={(v) => setCfg({ vol: v })} />
          <RangeField label="Risk-Free Rate" value={cfg.rf} min={0} max={9} step={0.25} color="#34d399" unit="%" onChange={(v) => setCfg({ rf: v })} />

          <div className="grid grid-cols-2 gap-[10px]">
            <FormGroup label="CPPI Floor %">
              <Input type="number" value={cfg.floor} min={50} max={95} onChange={(e) => setCfg({ floor: parseFloat(e.target.value) || 70 })} />
            </FormGroup>
            <FormGroup label="Tax Bracket">
              <Select value={cfg.tax} onChange={(e) => setCfg({ tax: parseFloat(e.target.value) })}>
                <option value="0">0% (ISA/Tax-free)</option>
                <option value="15">15% (LT US)</option>
                <option value="20">20% (High earner)</option>
                <option value="37">37% (ST US)</option>
                <option value="45">45% (UK Higher)</option>
              </Select>
            </FormGroup>
          </div>
        </Card>

        <div>
          {/* Markov Bars */}
          <Card className="mb-[13px]">
            <CardHeader title="Markov Regime Probabilities" />
            {[
              { k: 'expansion', l: '🟢 Expansion', c: '#10b981' },
              { k: 'stagflation', l: '🟡 Stagflation', c: '#f0b429' },
              { k: 'recession', l: '🟠 Recession', c: '#f97316' },
              { k: 'crisis', l: '🔴 Crisis', c: '#ef4444' },
            ].map((r) => (
              <div key={r.k} className="mb-[9px]">
                <div className="flex justify-between mb-[2px]">
                  <span className="text-[10px] text-[#8892b0]">{r.l}</span>
                  <span className="font-mono text-[10px] text-[#7390fa]">{((markov[r.k] || 0) * 100).toFixed(1)}%</span>
                </div>
                <ProgressBar value={(markov[r.k] || 0) * 100} color={r.c} />
              </div>
            ))}
          </Card>

          {/* Engine Output */}
          <Card>
            <CardHeader title="Engine Output" />
            <MetricRow label="Blended CAGR (Gross)" value={(grossBlend * 100).toFixed(2) + '%'} color="#7390fa" />
            <MetricRow label="Post-Tax CAGR" value={(ptBlend * 100).toFixed(2) + '%'} color="#34d399" />
            <MetricRow label="L3 Kelly (Adjusted)" value={(kellyEff * 100).toFixed(1) + '%'} color="#fcd34d" />
            <MetricRow label="CPPI Floor" value={fmtShort(cfg.C * cfg.floor / 100)} color="#10b981" />
            <MetricRow label="CPPI Cushion" value={fmtShort(cushion)} color="#7390fa" />
            <MetricRow label="Current Regime" value={regime.charAt(0).toUpperCase() + regime.slice(1)} color={regimeColors[regime]} />
          </Card>
        </div>
      </div>

      {/* Allocation Table */}
      <Card>
        <CardHeader title="Layer Breakdown Table" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {['Layer', 'Alloc %', 'Capital', 'Gross Return', 'Post-Tax CAGR', 'Kelly Fraction', 'Risk Contrib.', 'CPPI Role'].map((h) => (
                  <th key={h} className="font-mono text-[8px] font-medium tracking-[0.14em] uppercase text-[#3d4a6b] px-[11px] py-2 text-left border-b border-[#1a2035] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {layers.map((l) => (
                <tr key={l.k} className="hover:bg-[rgba(255,255,255,0.018)]">
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035]"><span className="font-semibold" style={{ color: LAYER_COLORS[l.k] }}>{l.n}</span></td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono">{(alloc[l.k] || 0).toFixed(1)}%</td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono">{fmtShort(cfg.C * (alloc[l.k] || 0) / 100)}</td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono text-[#34d399]">{l.gross.toFixed(1)}%</td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono text-[#34d399]">{(rf + (l.gross / 100 - rf) * (1 - taxRate) * 100).toFixed(2)}%</td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono text-[#fcd34d]">{l.k === 'spec' ? (kellyEff * 100).toFixed(1) + '%' : 'N/A'}</td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono">{l.k === 'safe' ? '5%' : l.k === 'growth' ? '55%' : l.k === 'spec' ? '35%' : '5%'}</td>
                  <td className="px-[11px] py-[9px] border-b border-[#1a2035] text-[10px] text-[#3d4a6b]">{l.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function RangeField({ label, value, min, max, step = 1, color, unit, onChange }) {
  return (
    <div className="mb-3">
      <label className="block font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-[#3d4a6b] mb-1">
        {label}: <span style={{ color }}>{value}{unit}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}
