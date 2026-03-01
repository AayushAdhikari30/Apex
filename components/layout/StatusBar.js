'use client'
import { useState, useEffect } from 'react'
import useApexStore from '@/store/apexStore'

export default function StatusBar({ syncStatus }) {
  const { prices, positions, macro } = useApexStore()
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 60 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const statusColor = syncStatus === 'LIVE' ? '#34d399' : syncStatus === 'SYNCING' ? '#fbbf24' : '#f87171'

  return (
    <div className="h-6 bg-[#0c0f1f] border-t border-[#1a2035] flex items-center px-[14px] gap-[14px] font-mono text-[9px] text-[#3d4a6b] flex-shrink-0">
      <span>STATUS <span style={{ color: statusColor }}>{syncStatus}</span></span>
      <span>BTC <span className="text-[#8892b0]">{prices.BTC?.p ? '$' + Math.round(prices.BTC.p).toLocaleString() : '—'}</span></span>
      <span>GOLD <span className="text-[#8892b0]">{prices.XAU?.p ? '$' + Math.round(prices.XAU.p).toLocaleString() : '—'}</span></span>
      <span>POS <span className="text-[#8892b0]">{positions.length}</span></span>
      <span>MRS <span className="text-[#8892b0]">{macro.mrs?.toFixed(1) || '—'}</span></span>
      <span>SYNC <span className="text-[#8892b0]">{countdown}s</span></span>
      <span className="ml-auto">APEX v3.0 · Adaptive Portfolio Economics System</span>
    </div>
  )
}
