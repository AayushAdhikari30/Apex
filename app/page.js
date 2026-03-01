'use client'
import { useState, useEffect, useCallback } from 'react'
import useApexStore, { fmt, fmtShort, fmtPct } from '@/store/apexStore'
import { useLiveData } from '@/hooks/useLiveData'
import AuthPage from '@/components/auth/AuthPage'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import StatusBar from '@/components/layout/StatusBar'
import AddPositionModal from '@/components/modals/AddPositionModal'
import DashboardPage from '@/components/pages/Dashboard'
import PortfolioPage from '@/components/pages/Portfolio'
import PositionsPage from '@/components/pages/Positions'
import RiskPage from '@/components/pages/Risk'
import MacroPage from '@/components/pages/Macro'
import {
  FunnelPage, StressPage, MonteCarloPage, TaxPage, MilestonesPage, AlertsPage, SettingsPage
} from '@/components/pages/OtherPages'

export default function App() {
  const { user, positions, alerts, calcPortfolio, calcHealthScore, cfg, logout, isDemo } = useApexStore()
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [posModalOpen, setPosModalOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState('IDLE')
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Auto-login from persisted state
  useEffect(() => {
    if (!mounted) return
    if (user?.id) setAuthed(true)
  }, [mounted, user])

  const handleAuth = (isNew) => {
    setAuthed(true)
    if (isNew) setPage('dashboard')
  }

  const handleLogout = () => {
    logout()
    setAuthed(false)
    setPage('dashboard')
  }

  const { refetch } = useLiveData()
  const handleSync = useCallback(async () => {
    setSyncStatus('SYNCING')
    await refetch()
    setSyncStatus('LIVE')
  }, [refetch])

  const handleExport = () => {
    const { ly, total } = calcPortfolio()
    const hs = calcHealthScore()
    const rows = [
      ['APEX v3 — Portfolio Report', '', new Date().toLocaleString()],
      ['User', user.name],
      ['Total Capital', fmtShort(total)],
      ['Health Score', hs + '/100'],
      ['Regime', useApexStore.getState().regime],
      [''],
      ['Layer', 'Value', '% of Portfolio'],
      ...Object.entries({ safe: 'Safe (L1)', growth: 'Growth (L2)', spec: 'Speculative (L3)', cash: 'Cash' })
        .map(([k, n]) => [n, fmtShort(ly[k] || 0), ((ly[k] || 0) / Math.max(total, 1) * 100).toFixed(1) + '%']),
      [''],
      ['Positions'],
      ...positions.map((p) => [p.sym, p.lyr, fmtShort(p.cur || p.val), p.ent ? fmtPct((p.cur - p.val) / p.val * 100) : '—']),
    ]
    const csv = rows.map((r) => r.map((c) => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'APEX_Report_' + Date.now() + '.csv'
    a.click()
  }

  if (!mounted) return null
  if (!authed) return <AuthPage onAuth={handleAuth} />

  const pageMap = {
    dashboard: <DashboardPage />,
    portfolio: <PortfolioPage />,
    positions: <PositionsPage onAddPosition={() => setPosModalOpen(true)} />,
    funnel: <FunnelPage />,
    risk: <RiskPage />,
    macro: <MacroPage onSync={handleSync} />,
    stress: <StressPage />,
    monte: <MonteCarloPage />,
    tax: <TaxPage />,
    milestones: <MilestonesPage />,
    alerts: <AlertsPage />,
    settings: <SettingsPage onLogout={handleLogout} />,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={page} onNav={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          page={page}
          onSync={handleSync}
          onAddPosition={() => setPosModalOpen(true)}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onExport={handleExport}
        />

        <main className="flex-1 overflow-y-auto p-[18px] pb-[60px] md:pb-[18px]">
          {pageMap[page] || pageMap.dashboard}
        </main>

        <StatusBar syncStatus={syncStatus} />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08091a] border-t border-[#1a2035] z-60 pb-[max(6px,env(safe-area-inset-bottom))]">
        <div className="flex justify-around pt-[6px]">
          {[
            { id: 'dashboard', icon: '▦', label: 'Home' },
            { id: 'positions', icon: '≡', label: 'Positions' },
            { id: 'portfolio', icon: '◎', label: 'Engine' },
            { id: 'risk', icon: '◉', label: 'Risk' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' },
          ].map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center gap-[2px] px-[10px] py-1 text-[9px] font-mono cursor-pointer border-none bg-transparent transition-colors ${page === item.id ? 'text-[#7390fa]' : 'text-[#3d4a6b]'}`}
              onClick={() => setPage(item.id)}
            >
              <span className="text-[17px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <AddPositionModal open={posModalOpen} onClose={() => setPosModalOpen(false)} />
    </div>
  )
}
