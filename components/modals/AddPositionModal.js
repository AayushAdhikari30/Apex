'use client'
import { useState } from 'react'
import useApexStore from '@/store/apexStore'
import { Modal, FormGroup, Input, Select, Btn } from '@/components/ui'
import { clamp } from '@/store/apexStore'

const DEFAULTS = { sym: '', lyr: 'growth', val: '', ent: '', sl: '20', type: 'Equity / ETF', note: '' }

export default function AddPositionModal({ open, onClose, onAdded }) {
  const { addPosition } = useApexStore()
  const [form, setForm] = useState(DEFAULTS)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.sym.trim()) { setErr('Symbol is required'); return }
    const val = parseFloat(form.val)
    if (!val || val <= 0) { setErr('Please enter a valid cost basis'); return }
    addPosition({
      sym: form.sym.toUpperCase().trim(),
      lyr: form.lyr,
      val,
      ent: parseFloat(form.ent) || 0,
      sl: clamp(parseFloat(form.sl) || 20, 1, 80),
      type: form.type,
      note: form.note,
    })
    const sym = form.sym.toUpperCase().trim()
    setForm(DEFAULTS)
    setErr('')
    onClose()
    onAdded?.(sym)
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Position" subtitle="Track a holding within the LCGS three-layer framework">
      {err && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.28)] rounded-lg px-3 py-2 text-[11px] text-[#f87171] mb-3">{err}</div>
      )}

      <div className="grid grid-cols-2 gap-[10px]">
        <FormGroup label="Symbol">
          <Input
            value={form.sym}
            onChange={(e) => set('sym', e.target.value.toUpperCase())}
            placeholder="BTC, SPY, XAU..."
          />
        </FormGroup>
        <FormGroup label="Layer">
          <Select value={form.lyr} onChange={(e) => set('lyr', e.target.value)}>
            <option value="safe">L1 — Safe</option>
            <option value="growth">L2 — Growth</option>
            <option value="spec">L3 — Speculative</option>
          </Select>
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <FormGroup label="Cost Basis (USD)">
          <Input type="number" value={form.val} onChange={(e) => set('val', e.target.value)} placeholder="10,000" min="0" />
        </FormGroup>
        <FormGroup label="Entry Price">
          <Input type="number" value={form.ent} onChange={(e) => set('ent', e.target.value)} placeholder="Optional" />
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <FormGroup label="Stop-Loss %">
          <Input type="number" value={form.sl} onChange={(e) => set('sl', e.target.value)} min="1" max="80" />
        </FormGroup>
        <FormGroup label="Asset Type">
          <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option>Equity / ETF</option>
            <option>Crypto</option>
            <option>Commodity</option>
            <option>Bond / Fixed Income</option>
            <option>REIT</option>
          </Select>
        </FormGroup>
      </div>

      <FormGroup label="Notes">
        <Input value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Investment thesis..." />
      </FormGroup>

      <div className="flex gap-[9px] mt-[14px]">
        <Btn variant="primary" className="flex-1" onClick={handleSubmit}>Add Position</Btn>
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  )
}
