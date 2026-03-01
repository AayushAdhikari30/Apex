'use client'
import { useState } from 'react'
import useApexStore from '@/store/apexStore'
import { LiveDot, ProgressBar } from '@/components/ui'
import clsx from 'clsx'

const NAV = [
  { id: 'dashboard', icon: '▦', label: 'Dashboard', group: 'Core' },
  { id: 'portfolio', icon: '◎', label: 'Portfolio Engine', group: 'Core' },
  { id: 'positions', icon: '≡', label: 'Positions', badge: 'pos', group: 'Core' },
  { id: 'funnel', icon: '▽', label: 'Profit Funnel', group: 'Core' },
  { id: 'risk', icon: '◉', label: 'Risk & CVaR', badge: 'risk', group: 'Analysis' },
  { id: 'macro', icon: '🌐', label: 'Macro Engine', group: 'Analysis' },
  { id: 'stress', icon: '⚡', label: 'Stress Tests', group: 'Analysis' },
  { id: 'monte', icon: '🎲', label: 'Monte Carlo', group: 'Analysis' },
  { id: 'tax', icon: '$', label: 'Tax Engine', group: 'Tools' },
  { id: 'milestones', icon: '🏆', label: 'Milestones', group: 'Tools' },
  { id: 'alerts', icon: '🔔', label: 'Alerts', badge: 'alerts', group: 'Tools' },
  { id: 'settings', icon: '⚙', label: 'Settings', group: 'Tools' },
]

export default function Sidebar({ activePage, onNav, open, onClose }) {
  const { user, alerts, positions, healthScore } = useApexStore()
  const score = healthScore || 0
  const scoreColor = score >= 80 ? '#34d399' : score >= 60 ? '#fcd34d' : '#f87171'

  const badges = {
    pos: positions.length > 0 ? positions.length : null,
    risk: alerts.filter((a) => a.type === 'warn').length || null,
    alerts: alerts.length || null,
  }

  const groups = [...new Set(NAV.map((n) => n.group))]

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} />}

      <aside
        className={clsx(
          'w-[230px] min-w-[230px] bg-[#08091a] border-r border-[#1a2035] flex flex-col h-screen sticky top-0 z-50 transition-transform duration-300',
          'max-md:fixed max-md:left-0 max-md:h-full',
          open ? 'max-md:translate-x-0 max-md:shadow-[8px_0_28px_rgba(0,0,0,0.6)]' : 'max-md:-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="px-[14px] pt-4 pb-3 border-b border-[#1a2035]">
          <div className="flex items-center gap-2 font-display text-2xl italic text-[#7390fa]">
            <LiveDot />
            APEX
            <span className="text-[10px] bg-[rgba(79,110,247,0.2)] text-[#7390fa] px-[6px] py-[1px] rounded font-mono font-semibold not-italic">v3</span>
          </div>
          <div className="flex items-center gap-2 mt-[10px]">
            <div className="w-7 h-7 rounded-full bg-[#4f6ef7] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold leading-none mb-[2px]">{user.name || 'User'}</div>
              <div className="font-mono text-[9px] text-[#3d4a6b]">{(user.tier || 'FREE').toUpperCase()} TIER</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {groups.map((group) => (
            <div key={group}>
              <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#3d4a6b] px-2 pt-[10px] pb-[3px]">{group}</div>
              {NAV.filter((n) => n.group === group).map((item) => {
                const badge = item.badge ? badges[item.badge] : null
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      'flex items-center gap-2 px-[9px] py-2 rounded-[7px] cursor-pointer text-xs font-medium transition-all mb-[1px] border',
                      activePage === item.id
                        ? 'bg-[rgba(79,110,247,0.12)] text-[#7390fa] border-[rgba(79,110,247,0.2)]'
                        : 'text-[#8892b0] border-transparent hover:bg-[#0c0f1f] hover:text-[#e2e8f0]'
                    )}
                    onClick={() => { onNav(item.id); onClose?.() }}
                  >
                    <span className="text-[13px] w-[15px] text-center flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                    {badge ? (
                      <span className="ml-auto font-mono text-[9px] font-bold bg-[#ef4444] text-white px-[5px] py-[1px] rounded-lg">{badge}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Health mini */}
        <div className="p-[10px] border-t border-[#1a2035]">
          <div className="bg-[#0c0f1f] border border-[#1a2035] rounded-[9px] p-[10px_12px]">
            <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[#3d4a6b] mb-1">Health Score</div>
            <div className="font-display text-[26px] font-bold italic leading-none" style={{ color: scoreColor }}>
              {score || '—'}
            </div>
            <ProgressBar value={score} color={scoreColor} className="mt-[5px]" />
          </div>
        </div>
      </aside>
    </>
  )
}
