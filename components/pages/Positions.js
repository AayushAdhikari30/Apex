'use client'
import { useMemo } from 'react'
import useApexStore, { LAYER_COLORS, LAYER_NAMES, pct, fmtShort, fmtPct, clamp } from '@/store/apexStore'
import { Card, CardHeader, Btn, SectionHeader, ProgressBar, LayerPill } from '@/components/ui'

export default function PositionsPage({ onAddPosition }) {
  const { positions, removePosition, cfg, calcPortfolio, calcHealthScore, alerts } = useApexStore()
  const { ly, total } = useMemo(() => calcPortfolio(), [positions])
  const hs = useMemo(() => calcHealthScore(), [positions, alerts])
  const pp = (k) => pct(ly[k] || 0, total)
  const hsColor = hs >= 80 ? '#34d399' : hs >= 60 ? '#fcd34d' : '#f87171'

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Positions"
        subtitle="Real-time P&L · Stop-loss monitoring · Funnel triggers"
        right={<Btn variant="primary" onClick={onAddPosition}>+ Add Position</Btn>}
      />

      {/* Table */}
      <Card className="mb-[13px] overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {['Symbol', 'Layer', 'Cost Basis', 'Entry', 'Current Value', 'P&L', 'P&L %', 'Stop', 'Status', 'Date', ''].map((h) => (
                <th key={h} className="font-mono text-[8px] font-medium tracking-[0.14em] uppercase text-[#3d4a6b] px-[11px] py-2 text-left border-b border-[#1a2035] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-[#3d4a6b] py-7 text-[11px]">
                  No positions yet. Click <strong className="text-[#8892b0]">+ Add Position</strong> to start tracking.
                </td>
              </tr>
            ) : (
              positions.map((p) => {
                const cur = p.cur || p.val
                const pnl = p.ent ? cur - p.val : 0
                const gainPct = p.val > 0 ? (pnl / p.val) * 100 : 0
                const isStop = p.ent && cur <= p.val * (1 - p.sl / 100)
                const isHarvest = gainPct >= 40 && p.lyr === 'spec'
                const isRotate = gainPct >= 30 && p.lyr === 'growth'
                const pnlColor = pnl >= 0 ? '#34d399' : '#f87171'

                return (
                  <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.018)]">
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035]">
                      <strong style={{ color: LAYER_COLORS[p.lyr] }}>{p.sym}</strong>
                      {p.note && <div className="text-[9px] text-[#3d4a6b] mt-[1px]">{p.note}</div>}
                    </td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035]"><LayerPill layer={p.lyr} /></td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono">{fmtShort(p.val)}</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono text-[10px]">{p.ent ? '$' + p.ent.toLocaleString() : '—'}</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono" style={{ color: pnlColor }}>{fmtShort(cur)}</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono" style={{ color: pnlColor }}>{pnl >= 0 ? '+' : ''}{fmtShort(pnl)}</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono" style={{ color: pnlColor }}>{fmtPct(gainPct)}</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono text-[#fcd34d]">{p.sl}%</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035]">
                      {isStop ? <span className="text-[#f87171] font-semibold">⚠ STOP</span>
                        : isHarvest ? <span className="text-[#fcd34d]">⚡ HARVEST</span>
                        : isRotate ? <span className="text-[#7390fa]">→ ROTATE</span>
                        : <span className="text-[#34d399]">● OK</span>}
                    </td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035] font-mono text-[9px] text-[#3d4a6b]">{p.ts}</td>
                    <td className="px-[11px] py-[9px] border-b border-[#1a2035]">
                      <button
                        className="bg-none border-none text-[#3d4a6b] cursor-pointer text-base leading-none px-1 hover:text-[#ef4444] transition-colors"
                        onClick={() => removePosition(p.id)}
                      >×</button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
        {/* Layer Exposure */}
        <Card>
          <CardHeader title="Layer Exposure" />
          {Object.entries(LAYER_NAMES).map(([k, n]) => {
            const a = ly[k] || 0
            const p = pct(a, total)
            return (
              <div key={k} className="mb-2">
                <div className="flex justify-between mb-[2px]">
                  <span className="text-[10px]" style={{ color: LAYER_COLORS[k] }}>{n}</span>
                  <span className="font-mono text-[10px]">{fmtShort(a)} <span className="text-[#3d4a6b]">{p.toFixed(1)}%</span></span>
                </div>
                <ProgressBar value={clamp(p, 0, 100)} color={LAYER_COLORS[k]} />
              </div>
            )
          })}
        </Card>

        {/* Risk Controls */}
        <Card>
          <CardHeader title="Risk Controls" />
          {[
            { l: 'CVaR 95%', v: fmtShort(total * 0.12), c: '#f87171', s: 'Daily expected tail loss' },
            { l: 'Gold Hedge Req.', v: fmtShort(total * 0.08), c: '#fcd34d', s: '≥8% in debase hedges' },
            { l: 'L3 Harvest Trigger', v: fmtShort((ly.spec || 0) * 1.4), c: '#f97316', s: '+40% → rotate to L2' },
            { l: 'CPPI Floor', v: fmtShort(cfg.C * cfg.floor / 100), c: '#10b981', s: `${cfg.floor}% of C protected` },
          ].map((r) => (
            <div key={r.l} className="flex justify-between p-[8px_9px] bg-[#0c0f1f] rounded-lg mb-[5px]">
              <div>
                <div className="text-[11px] text-[#8892b0]">{r.l}</div>
                <div className="font-mono text-[9px] text-[#3d4a6b]">{r.s}</div>
              </div>
              <span className="text-[13px] font-bold font-mono" style={{ color: r.c }}>{r.v}</span>
            </div>
          ))}
        </Card>

        {/* Portfolio Score */}
        <Card>
          <CardHeader title="Portfolio Score" />
          <div className="text-center py-[10px]">
            <div className="font-display text-[50px] font-bold italic leading-none" style={{ color: hsColor }}>{hs}</div>
            <div className="font-mono text-[9px] text-[#3d4a6b] mt-[2px]">HEALTH SCORE</div>
            <ProgressBar value={hs} color={hsColor} height={7} className="my-[10px]" />
            <div className="text-[11px]" style={{ color: hsColor }}>
              {hs >= 80 ? 'Excellent · Formula compliant' : hs >= 60 ? 'Good · Minor adjustments' : 'Needs attention — review layers'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
