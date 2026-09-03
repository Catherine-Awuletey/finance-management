import { useMemo, useState } from 'react'

const empty = {
  date: new Date().toISOString().slice(0, 10),
  client: '',
  handle: '',
  set: '',
  mapping: '',
  amount: '',
  period: '',
  notes: '',
}

export default function OrderForm({ order, inventory = [], onSave, onCancel }) {
  const [form, setForm] = useState(order ? { ...empty, ...order } : empty)

  const setOptions = useMemo(() => {
    const names = new Set(inventory.map((i) => i.name).filter(Boolean))
    if (order?.set) names.add(order.set)
    if (form.set) names.add(form.set)
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [inventory, order?.set, form.set])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const applySetDefaults = (setName) => {
    const item = inventory.find((i) => i.name === setName)
    if (!item) return
    setForm((f) => ({
      ...f,
      set: setName,
      mapping: f.mapping || item.mapping || '',
      amount: f.amount || (item.price > 0 ? String(item.price) : ''),
    }))
  }

  const handleSetChange = (setName) => {
    set('set', setName)
    applySetDefaults(setName)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{order ? 'Edit Order' : 'New Order'}</h3>
      <div className="form-grid">
        <label>
          Date
          <input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} />
        </label>
        <label>
          Client name
          <input value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Client name" />
        </label>
        <label>
          Handle / contact
          <input value={form.handle} onChange={(e) => set('handle', e.target.value)} placeholder="Instagram, Snap, phone…" />
        </label>
        <label>
          Set
          <input
            list="set-options"
            value={form.set}
            onChange={(e) => handleSetChange(e.target.value)}
            placeholder="Pick from inventory or type a set"
          />
          <datalist id="set-options">
            {setOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label>
          Mapping
          <input value={form.mapping} onChange={(e) => set('mapping', e.target.value)} placeholder="e.g. 10, 12, 14, 16" />
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
          <input value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Delivery notes, deposit, etc." />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Order</button>
      </div>
    </form>
  )
}
