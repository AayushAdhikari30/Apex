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
import { FunnelPage, StressPage, MonteCarloPage, TaxPage, MilestonesPage, AlertsPage, SettingsPage } from '@/components/pages/OtherPages'
import LandingPage from '@/components/landing/LandingPage'
import { FreemiumBanner, LockedFeature, useGate } from '@/components/monetization/FreemiumGate'
import { PostAddAffiliate, RevenueTracker } from '@/components/monetization/AffiliateLinks'

export default function App() {
  const { user, positions, alerts, calcPortfolio, calcHealthScore, cfg, logout, setUser } = useApexStore()
  const [view, setView] = useState('landing')
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [posModalOpen, setPosModalOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState('IDLE')
  const [mounted, setMounted] = useState(false)
  const [lastAddedSym, setLastAddedSym] = useState(null)
  const [showAffPrompt, setShowAffPrompt] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const params = new URLSearchParams(window.location.search)
    const upgraded = params.get('upgraded')
    if (upgraded && user?.id) {
      setUser({ ...user, tier: upgraded })
      window.history.replaceState({}, '', '/')
    }
    if (user?.id) setView('app')
  }, [mounted])

  const handleAuth = () => setView('app')
  const handleLogout = () => { logout(); setView('landing') }
  const handlePositionAdded = (sym) => {
    setLastAddedSym(sym)
    setShowAffPrompt(true)
    setTimeout(() => setShowAffPrompt(false), 8000)
  }

  const { refetch } = useLiveData()
  const handleSync = useCallback(async () => {
    setSyncStatus('SYNCING')
    await refetch()
    setSyncStatus('LIVE')
  }, [refetch])

  if (!mounted) return null
  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />
  if (view === 'auth') return <AuthPage onAuth={handleAuth} />

  const { isPro, canExport } = useGate()

  const pageMap = {
    dashboard: <DashboardPage />,
    portfolio: <PortfolioPage />,
    positions: <PositionsPage onAddPosition={() => setPosModalOpen(true)} />,
    funnel: <FunnelPage />,
    risk: <RiskPage />,
    macro: <MacroPage onSync={handleSync} />,
    stress: <StressPage />,
    monte: <LockedFeature feature="Monte Carlo Simulation"><MonteCarloPage /></LockedFeature>,
    tax: <LockedFeature feature="Tax Engine"><TaxPage /></LockedFeature>,
    milestones: <MilestonesPage />,
    alerts: <AlertsPage />,
    revenue: (
      <div className="animate-fade-up">
        <div className="font-display text-[20px] font-bold italic mb-1">Revenue Tracker</div>
        <div className="font-mono text-[10px] text-[#3d4a6b] mb-4">Your affiliate and subscription earnings</div>
        <div className="bg-[#0f1326] border border-[#1a2035] rounded-xl p-5"><RevenueTracker /></div>
      </div>
    ),
    settings: <SettingsPage onLogout={handleLogout} />,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={page} onNav={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar page={page} onSync={handleSync} onAddPosition={() => setPosModalOpen(true)} onToggleSidebar={() => setSidebarOpen(o => !o)} onExport={() => {}} />
        <FreemiumBanner />
        <main className="flex-1 overflow-y-auto p-[18px] pb-[60px] md:pb-[18px]">
          {pageMap[page] || pageMap.dashboard}
        </main>
        <StatusBar syncStatus={syncStatus} />
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08091a] border-t border-[#1a2035] z-60 pb-safe">
        <div className="flex justify-around pt-[6px]">
          {[{id:'dashboard',icon:'▦',label:'Home'},{id:'positions',icon:'≡',label:'Positions'},{id:'portfolio',icon:'◎',label:'Engine'},{id:'risk',icon:'◉',label:'Risk'},{id:'alerts',icon:'🔔',label:'Alerts'}].map(item => (
            <button key={item.id} className={`flex flex-col items-center gap-[2px] px-[10px] py-1 text-[9px] font-mono cursor-pointer border-none bg-transparent transition-colors ${page === item.id ? 'text-[#7390fa]' : 'text-[#3d4a6b]'}`} onClick={() => setPage(item.id)}>
              <span className="text-[17px]">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      </nav>
      <AddPositionModal open={posModalOpen} onClose={() => setPosModalOpen(false)} onAdded={handlePositionAdded} />
      {showAffPrompt && lastAddedSym && <PostAddAffiliate sym={lastAddedSym} onClose={() => setShowAffPrompt(false)} />}
    </div>
  )
}
