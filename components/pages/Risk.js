'use client'
import { useMemo } from 'react'
import useApexStore, { clamp, fmtShort } from '@/store/apexStore'
import { Card, CardHeader, KpiCard, SectionHeader, MetricRow } from '@/components/ui'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function RiskPage() {
  const { cfg, macro, positions, calcPortfolio } = useApexStore()
  const { total } = useMemo(() => calcPortfolio(), [positions])

  const sigma = cfg.vol / 100
  const rf = cfg.rf / 100
  const mu = cfg.l3r / 100

  // EGARCH approximation
  const omega = 0.00001, alpha = 0.1, beta = 0.85
  const lrv = Math.sqrt(omega / (1 - alpha - beta))
  const lev = sigma * (1 + 0.18 * ((macro.vix - 18) / 18))
  const jump = sigma * 0.28 * ((macro.mrs || 0) / 10)
  const egVol = clamp(lev + jump, 0.05, 0.85)

  const z99 = 2.326, z95 = 1.645
  const daily = egVol / Math.sqrt(252)
  const var95 = total * daily * z95
  const var99 = total * daily * z99
  const cvar95 = var95 * 1.4
  const cvar99 = var99 * 1.35
  const sharpe = (mu - rf) / sigma
  const sortino = (mu - rf) / (sigma * 0.72)
  const calmar = (mu * 100) / 20

  // Simulated VIX path
  const vixData = useMemo(() => {
    const base = macro.vix || 18
    return Array.from({ length: 60 }, (_, i) => ({
      i,
      vix: i === 59 ? base : clamp(15 + Math.sin(i * 0.4) * 5 + (Math.random() - 0.5) * 3, 8, 55),
    }))
  }, [macro.vix])

  // Correlation matrix
  const cr = macro.mrs > 7 ? 0.82 : macro.mrs > 5 ? 0.55 : 0.28
  const assets = ['L1 Safe', 'L2 Growth', 'L3 Spec', 'Gold', 'Cash']
  const corrM = [
    [1, 0.15 + cr * 0.1, 0.08 + cr * 0.08, cr > 0.6 ? -0.1 : 0.1, 0.02],
    [0.15 + cr * 0.1, 1, 0.65 + cr * 0.2, cr > 0.6 ? 0.3 : 0.1, 0.05],
    [0.08 + cr * 0.08, 0.65 + cr * 0.2, 1, cr > 0.6 ? 0.4 : 0.15, 0.08],
    [cr > 0.6 ? -0.1 : 0.1, cr > 0.6 ? 0.3 : 0.1, cr > 0.6 ? 0.4 : 0.15, 1, 0.02],
    [0.02, 0.05, 0.08, 0.02, 1],
  ]

  const vixColor = macro.vix > 28 ? '#f87171' : macro.vix > 18 ? '#fbbf24' : '#34d399'

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Risk & CVaR Engine" subtitle="EGARCH asymmetric volatility · Jump-diffusion approximation · Tail risk" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[11px] mb-[13px]">
        <KpiCard title="CVaR 95% (Daily)" value={fmtShort(cvar95)} color="#f87171" sub="Expected loss worst 5%" />
        <KpiCard title="VaR 99% (Daily)" value={fmtShort(var99)} color="#f87171" sub="1-day 99% confidence" />
        <KpiCard title="EGARCH Volatility" value={(egVol * 100).toFixed(1) + '%'} color="#fcd34d" sub="Asymmetric annualised vol" />
        <KpiCard title="Sharpe Ratio" value={sharpe.toFixed(2)} color={sharpe > 1 ? '#34d399' : sharpe > 0.5 ? '#fcd34d' : '#f87171'} sub="Risk-adjusted return" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px] mb-[13px]">
        {/* EGARCH */}
        <Card>
          <CardHeader title="EGARCH Decomposition" />
          <MetricRow label="Base Volatility (σ)" value={(sigma * 100).toFixed(1) + '%'} />
          <MetricRow label="Leverage Effect (↓asymmetry)" value={'+' + ((lev - sigma) * 100).toFixed(1) + '%'} color="#f87171" />
          <MetricRow label="Jump Premium (MRS-weighted)" value={'+' + (jump * 100).toFixed(1) + '%'} color="#fcd34d" />
          <MetricRow label="EGARCH Total Vol" value={(egVol * 100).toFixed(1) + '%'} color="#f87171" />
          <MetricRow label="Long-Run Vol (ω/1-α-β)" value={(lrv * 100).toFixed(1) + '%'} />
          <MetricRow label="VIX Signal" value={macro.vix?.toFixed(1)} color={vixColor} bordered={false} />
        </Card>

        {/* VaR/CVaR */}
        <Card>
          <CardHeader title="VaR & CVaR Metrics" />
          <MetricRow label="VaR 95% (Daily)" value={fmtShort(var95)} color="#f87171" />
          <MetricRow label="VaR 99% (Daily)" value={fmtShort(var99)} color="#f87171" />
          <MetricRow label="CVaR 95% (Expected Shortfall)" value={fmtShort(cvar95)} color="#f87171" />
          <MetricRow label="CVaR 99%" value={fmtShort(cvar99)} color="#f87171" />
          <MetricRow label="Sharpe Ratio" value={sharpe.toFixed(2)} color="#34d399" />
          <MetricRow label="Sortino Ratio" value={sortino.toFixed(2)} color="#34d399" />
          <MetricRow label="Calmar Ratio" value={calmar.toFixed(2)} bordered={false} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
        {/* Correlation Matrix */}
        <Card>
          <CardHeader title="Correlation Matrix (Regime-Adjusted)" />
          <div className="text-[9px] text-[#3d4a6b] font-mono mb-2">● Low &lt;0.30  ● Medium 0.30–0.60  ● High &gt;0.60 (MRS {macro.mrs?.toFixed(1)})</div>
          <div className="overflow-x-auto">
            <table className="border-collapse text-[9px] font-mono">
              <thead>
                <tr>
                  <th className="p-[4px_7px] text-[#3d4a6b]"></th>
                  {assets.map((a) => <th key={a} className="p-[4px_6px] text-[#3d4a6b] whitespace-nowrap">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {assets.map((a, i) => (
                  <tr key={a}>
                    <td className="p-[4px_7px] text-[#3d4a6b] whitespace-nowrap">{a}</td>
                    {corrM[i].map((v, j) => {
                      const abs = Math.abs(v)
                      const color = abs > 0.6 ? '#f87171' : abs > 0.3 ? '#fbbf24' : '#34d399'
                      const bg = abs > 0.6 ? 'rgba(239,68,68,0.08)' : abs > 0.3 ? 'rgba(240,180,41,0.06)' : 'rgba(16,185,129,0.06)'
                      return <td key={j} className="p-[4px_6px] text-center" style={{ background: bg, color }}>{i === j ? '1.00' : v.toFixed(2)}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* VIX Chart */}
        <Card>
          <CardHeader title="Volatility Radar" right={<span className="font-mono text-[9px]" style={{ color: vixColor }}>VIX {macro.vix?.toFixed(1)}</span>} />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={vixData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="i" hide />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#3d4a6b', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ background: '#0f1326', border: '1px solid #1a2035', borderRadius: 6, fontSize: 10 }}
                formatter={(v) => [v.toFixed(1), 'VIX']}
              />
              <ReferenceLine y={25} stroke="rgba(251,191,36,0.4)" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="vix" stroke="#f87171" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="font-mono text-[9px] text-[#3d4a6b] mt-1">VIX 25 threshold — elevated volatility alert zone</div>
        </Card>
      </div>
    </div>
  )
}
