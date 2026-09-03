import { useMemo, useState } from 'react'
import { normalizeSupplierName } from '../lib/supabase'

const empty = {
  date: new Date().toISOString().slice(0, 10),
  vendor: '',
  description: '',
  amount: '',
  period: '',
  notes: '',
}

export default function ExpenseForm({ expense, suppliers = [], onSave, onCancel }) {
  const [form, setForm] = useState(expense ? { ...empty, ...expense } : empty)

  const vendorOptions = useMemo(() => {
    const names = new Set(suppliers.map((s) => s.name).filter(Boolean))
    if (expense?.vendor) names.add(expense.vendor)
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [suppliers, expense?.vendor])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.vendor.trim()) return
    onSave({
      ...form,
      vendor: normalizeSupplierName(form.vendor),
      amount: Number(form.amount),
    })
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{expense ? 'Edit Expense' : 'New Expense'}</h3>
      <div className="form-grid">
        <label>
          Date
          <input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} />
        </label>
        <label>
          Vendor
          <input
            list="vendor-options"
            value={form.vendor}
            onChange={(e) => set('vendor', e.target.value)}
            required
            placeholder="Type or pick a vendor"
          />
          <datalist id="vendor-options">
            {vendorOptions.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>
        <label className="full">
          Description
          <input value={form.description} onChange={(e) => set('description', e.target.value)} required placeholder="What did you buy?" />
        </label>
        <label>
          Amount (₵)
          <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} required min="0" />
        </label>
        <label>
          Period / week
          <input value={form.period} onChange={(e) => set('period', e.target.value)} placeholder="e.g. August Week 2" />
        </label>
        <label className="full">
          Notes
          <input value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Breakdown, delivery fee, etc." />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Expense</button>
      </div>
    </form>
  )
}
