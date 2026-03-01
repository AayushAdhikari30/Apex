'use client'
import { useEffect, useState } from 'react'
import useApexStore from '@/store/apexStore'
import { Btn } from '@/components/ui'
import clsx from 'clsx'

const PAGE_TITLES = {
  dashboard: 'Dashboard', portfolio: 'Portfolio Engine', positions: 'Positions',
  funnel: 'Profit Funnel', risk: 'Risk & CVaR', macro: 'Macro Engine',
  stress: 'Stress Tests', monte: 'Monte Carlo', tax: 'Tax Engine',
  milestones: 'Milestones', alerts: 'Alert Centre', settings: 'Settings',
}

export default function Topbar({ page, onSync, onAddPosition, onToggleSidebar, onExport }) {
  const { prices } = useApexStore()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-[50px] bg-[#08091a] border-b border-[#1a2035] flex items-center gap-[10px] px-[14px] flex-shrink-0 z-40">
      {/* Hamburger (mobile) */}
      <button className="md:hidden text-[#8892b0] text-lg leading-none p-1 cursor-pointer border-none bg-transparent" onClick={onToggleSidebar}>☰</button>

      <div className="font-display text-base italic whitespace-nowrap flex-shrink-0">{PAGE_TITLES[page] || page}</div>

      {/* Ticker */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {[
          { sym: 'BTC', data: prices.BTC },
          { sym: 'ETH', data: prices.ETH },
          { sym: 'XAU', data: prices.XAU },
          { sym: 'VIX', data: prices.VIX, special: true },
          { sym: '10Y', data: prices.TNX, pctLabel: true },
          { sym: 'DXY', data: prices.DXY },
        ].map(({ sym, data, special, pctLabel }) => (
          <div key={sym} className="flex items-center gap-1 px-[10px] border-r border-[#1a2035] last:border-none font-mono text-[10px] whitespace-nowrap">
            <span className="text-[#3d4a6b] text-[8px]">{sym}</span>
            <TickerValue sym={sym} data={data} special={special} pctLabel={pctLabel} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="font-mono text-[10px] text-[#3d4a6b] hidden sm:block">{clock}</div>
        <Btn variant="secondary" size="sm" onClick={onSync}>↺ Sync</Btn>
        <Btn variant="primary" size="sm" onClick={onAddPosition}>+ Position</Btn>
        <Btn variant="secondary" size="sm" onClick={onExport} className="hidden sm:inline-flex">⬇ Report</Btn>
      </div>
    </div>
  )
}

function TickerValue({ sym, data, special, pctLabel }) {
  const p = data?.p || 0
  const c = data?.c || 0
  if (!p) return <span className="text-[#3d4a6b]">—</span>

  if (special) {
    const color = p > 25 ? '#f87171' : p > 18 ? '#fbbf24' : '#34d399'
    return <span style={{ color }}>{p.toFixed(1)}</span>
  }
  if (pctLabel) return <span className="text-[#8892b0]">{p.toFixed(2)}%</span>

  const color = c >= 0 ? '#34d399' : '#f87171'
  const display = p > 100 ? ('$' + Math.round(p).toLocaleString()) : ('$' + p.toFixed(2))
  return <span style={{ color }}>{display}</span>
}
