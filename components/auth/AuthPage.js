'use client'
import { useState } from 'react'
import useApexStore from '@/store/apexStore'

const getDB = () => { try { return JSON.parse(localStorage.getItem('apex_users') || '{}') } catch { return {} } }
const saveDB = (u) => { try { localStorage.setItem('apex_users', JSON.stringify(u)) } catch {} }

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('sign')
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { setUser, setDemo } = useApexStore()

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErr('') }

  const doLogin = () => {
    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return }
    const db = getDB()
    const em = form.email.toLowerCase()
    if (!db[em]) { setErr('No account found with this email.'); return }
    if (db[em].pw !== btoa(form.password)) { setErr('Incorrect password.'); return }
    setUser({ name: db[em].name, email: em, tier: db[em].tier || 'free', id: em })
    onAuth(false)
  }

  const doRegister = () => {
    const { name, email, password } = form
    if (!name || !email || !password) { setErr('Please fill in all fields.'); return }
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setErr('Please enter a valid email.'); return }
    const db = getDB()
    const em = email.toLowerCase()
    if (db[em]) { setErr('An account with this email already exists.'); return }
    db[em] = { name, pw: btoa(password), tier: 'free', created: new Date().toISOString() }
    saveDB(db)
    setUser({ name, email: em, tier: 'free', id: em })
    onAuth(true)
  }

  const doDemo = () => {
    setDemo()
    onAuth(false)
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-[#05070f] flex items-center justify-center p-5">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-9">
          <div className="font-display text-[52px] font-bold italic text-[#7390fa] leading-none block">APEX</div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#3d4a6b] mt-1">
            Adaptive Portfolio Economics System · v3
          </div>
        </div>

        <div className="bg-[#0f1326] border border-[#1a2035] rounded-[13px] p-7">
          {/* Tabs */}
          <div className="flex gap-[3px] mb-[22px] bg-[#0c0f1f] rounded-lg p-[3px]">
            {['sign', 'reg'].map((t) => (
              <button
                key={t}
                className={`flex-1 text-center py-[7px] rounded-md text-xs font-medium transition-all ${tab === t ? 'bg-[#4f6ef7] text-white' : 'text-[#3d4a6b] hover:text-[#8892b0]'}`}
                onClick={() => { setTab(t); setErr('') }}
              >
                {t === 'sign' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {err && (
            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.28)] rounded-lg px-[11px] py-[9px] text-[11px] text-[#f87171] mb-[10px]">
              {err}
            </div>
          )}

          {tab === 'sign' ? (
            <div>
              <FieldGroup label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="you@example.com" />
              <FieldGroup label="Password" type="password" value={form.password} onChange={(v) => set('password', v)} placeholder="••••••••" />
              <AuthBtn onClick={doLogin}>Sign In to APEX</AuthBtn>
            </div>
          ) : (
            <div>
              <FieldGroup label="Your Name" type="text" value={form.name} onChange={(v) => set('name', v)} placeholder="Full name" />
              <FieldGroup label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="you@example.com" />
              <FieldGroup label="Password (8+ chars)" type="password" value={form.password} onChange={(v) => set('password', v)} placeholder="••••••••" />
              <AuthBtn onClick={doRegister}>Create Account</AuthBtn>
            </div>
          )}

          <div className="text-center my-[14px] text-[11px] text-[#3d4a6b] relative">
            <span className="relative z-10 px-2 bg-[#0f1326]">or</span>
            <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-[#1a2035]" /></div>
          </div>

          <button
            className="w-full py-[10px] border border-[#1a2035] rounded-lg bg-transparent text-[#8892b0] font-sans text-xs cursor-pointer hover:border-[#4f6ef7] hover:text-[#7390fa] transition-all"
            onClick={doDemo}
          >
            Continue with Demo Account
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldGroup({ label, type, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-[#3d4a6b] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0c0f1f] border border-[#1a2035] rounded-[7px] px-[11px] py-[9px] text-[#e2e8f0] text-sm outline-none focus:border-[#4f6ef7] placeholder:text-[#3d4a6b] font-sans"
      />
    </div>
  )
}

function AuthBtn({ children, onClick }) {
  return (
    <button
      className="w-full py-[11px] border-none rounded-lg bg-[#4f6ef7] text-white font-sans text-sm font-semibold cursor-pointer hover:bg-[#7390fa] transition-all mt-1"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
