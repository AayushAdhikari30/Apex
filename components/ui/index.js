'use client'
import clsx from 'clsx'
import { LAYER_COLORS } from '@/store/apexStore'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, glow, style }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-[#1a2035] bg-[#0f1326] p-[14px] transition-colors hover:border-[#222845]',
        glow && 'shadow-[0_0_20px_rgba(79,110,247,0.1)]',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

// ── CardHeader ────────────────────────────────────────────────────────────────
export function CardHeader({ title, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-[9px] font-medium tracking-[0.14em] uppercase text-[#3d4a6b]">{title}</span>
      {right}
    </div>
  )
}

// ── KpiCard ───────────────────────────────────────────────────────────────────
export function KpiCard({ title, value, sub, color = 'var(--t)' }) {
  return (
    <Card>
      <div className="font-mono text-[9px] font-medium tracking-[0.14em] uppercase text-[#3d4a6b] mb-1">{title}</div>
      <div className="font-display text-[22px] font-bold italic leading-none mb-1" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-[#3d4a6b]">{sub}</div>}
    </Card>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'neutral' }) {
  const styles = {
    up: 'bg-[rgba(16,185,129,0.14)] text-[#34d399]',
    down: 'bg-[rgba(239,68,68,0.14)] text-[#f87171]',
    neutral: 'bg-[rgba(148,163,184,0.1)] text-[#8892b0]',
    gold: 'bg-[rgba(240,180,41,0.14)] text-[#fcd34d]',
    blue: 'bg-[rgba(79,110,247,0.14)] text-[#7390fa]',
  }
  return (
    <span className={clsx('font-mono text-[10px] font-semibold px-[7px] py-[2px] rounded', styles[variant])}>
      {children}
    </span>
  )
}

// ── AlertBox ──────────────────────────────────────────────────────────────────
export function AlertBox({ type = 'info', title, body, time }) {
  const styles = {
    warn: 'bg-[rgba(239,68,68,0.07)] border-[rgba(239,68,68,0.22)]',
    ok: 'bg-[rgba(16,185,129,0.07)] border-[rgba(16,185,129,0.22)]',
    info: 'bg-[rgba(79,110,247,0.07)] border-[rgba(79,110,247,0.22)]',
    gold: 'bg-[rgba(240,180,41,0.07)] border-[rgba(240,180,41,0.22)]',
  }
  const icons = { warn: '⚠', ok: '✓', info: '◈', gold: '⚡' }
  return (
    <div className={clsx('flex gap-[10px] p-[10px_12px] rounded-lg border mb-[6px] animate-slide-in', styles[type])}>
      <div className="text-sm flex-shrink-0 pt-[1px]">{icons[type]}</div>
      <div>
        <div className="font-semibold text-xs mb-[2px]">{title}</div>
        <div className="text-[11px] text-[#8892b0] leading-[1.4]">{body}</div>
        {time && <div className="text-[9px] text-[#3d4a6b] mt-[2px] font-mono">{time}</div>}
      </div>
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, variant = 'secondary', size = 'md', onClick, className, disabled, style }) {
  const base = 'inline-flex items-center justify-center gap-[5px] rounded-[7px] font-medium cursor-pointer border transition-all font-sans whitespace-nowrap leading-none disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'text-[11px] px-[10px] py-[4px]', md: 'text-[12px] px-[12px] py-[6px]', lg: 'text-sm px-4 py-[10px]' }
  const variants = {
    primary: 'bg-[#4f6ef7] border-[#4f6ef7] text-white hover:bg-[#7390fa]',
    secondary: 'bg-transparent border-[#222845] text-[#8892b0] hover:border-[#4f6ef7] hover:text-[#7390fa]',
    danger: 'bg-transparent border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)]',
    success: 'bg-transparent border-[#10b981] text-[#10b981] hover:bg-[rgba(16,185,129,0.08)]',
  }
  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  )
}

// ── FormGroup ─────────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div className="mb-3">
      {label && <label className="block font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-[#3d4a6b] mb-1">{label}</label>}
      {children}
    </div>
  )
}

export function Input({ className, ...props }) {
  return (
    <input
      className={clsx('w-full bg-[#0c0f1f] border border-[#1a2035] rounded-[7px] px-[11px] py-[9px] text-[#e2e8f0] font-sans text-[13px] outline-none focus:border-[#4f6ef7] placeholder:text-[#3d4a6b]', className)}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={clsx('w-full bg-[#0c0f1f] border border-[#1a2035] rounded-[7px] px-[11px] py-[9px] text-[#e2e8f0] font-sans text-[13px] outline-none focus:border-[#4f6ef7] cursor-pointer', className)}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={clsx('w-full bg-[#0c0f1f] border border-[#1a2035] rounded-[7px] px-[11px] py-[9px] text-[#e2e8f0] font-sans text-[13px] outline-none focus:border-[#4f6ef7] placeholder:text-[#3d4a6b] resize-y min-h-[70px]', className)}
      {...props}
    />
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#4f6ef7', height = 3, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={clsx('rounded-full overflow-hidden', className)} style={{ height, background: '#1a2035' }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: pct + '%', background: color }} />
    </div>
  )
}

// ── MetricRow ─────────────────────────────────────────────────────────────────
export function MetricRow({ label, value, color, bordered = true }) {
  return (
    <div className={clsx('flex justify-between items-center py-[7px]', bordered && 'border-b border-[#1a2035] last:border-0')}>
      <span className="text-[11px] text-[#8892b0]">{label}</span>
      <span className="font-mono text-[11px]" style={{ color }}>{value}</span>
    </div>
  )
}

// ── LayerPill ─────────────────────────────────────────────────────────────────
export function LayerPill({ layer }) {
  const color = LAYER_COLORS[layer] || '#8892b0'
  const labels = { safe: 'L1 Safe', growth: 'L2 Growth', spec: 'L3 Spec', cash: 'Cash' }
  return (
    <span
      className="inline-flex items-center font-mono text-[9px] font-semibold px-[7px] py-[2px] rounded border"
      style={{ color, borderColor: color + '44' }}
    >
      {labels[layer] || layer}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-[#141930] border border-[#222845] rounded-[13px] p-[26px] w-[460px] max-w-[93vw] max-h-[90vh] overflow-y-auto animate-fade-up">
        {title && <div className="font-display text-[18px] font-bold italic mb-1">{title}</div>}
        {subtitle && <div className="text-[11px] text-[#8892b0] mb-[18px]">{subtitle}</div>}
        {children}
      </div>
    </div>
  )
}

// ── LiveDot ───────────────────────────────────────────────────────────────────
export function LiveDot({ color = '#10b981' }) {
  return (
    <div
      className="w-[6px] h-[6px] rounded-full flex-shrink-0 animate-pulse-dot"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="font-display text-[20px] font-bold italic">{title}</div>
        {subtitle && <div className="font-mono text-[10px] text-[#3d4a6b] mt-[2px]">{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-wrap">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}
