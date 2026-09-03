import { useState } from 'react'

const empty = {
  name: '',
  mapping: '',
  price: '',
  notes: '',
}

export default function InventoryForm({ item, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(item ? { ...empty, ...item, price: item.price ?? '' } : empty)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      price: Number(form.price) || 0,
    })
  }

  const handleDelete = () => {
    const orderNote = item?.orderCount > 0
      ? `\n\n${item.orderCount} order(s) using this set will stay in Orders — only the inventory item is removed.`
      : ''
    if (confirm(`Delete ${item.name}? This cannot be undone.${orderNote}`)) {
      onDelete(item.id)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{item ? 'Edit Set' : 'New Set'}</h3>
      <div className="form-grid">
        <label>
          Set name
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="e.g. Princess, Queen, Bbg Hybrid"
          />
        </label>
        <label>
          Default price (₵)
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            min="0"
            placeholder="150"
          />
        </label>
        <label className="full">
          Default mapping
          <input
            value={form.mapping}
            onChange={(e) => set('mapping', e.target.value)}
            placeholder="e.g. 10, 12, 14, 16"
          />
        </label>
        <label className="full">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Style details, curl type, tray info…"
            rows={3}
          />
        </label>
      </div>
      <div className="form-actions">
        {item && onDelete && (
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Delete set
          </button>
        )}
        <div className="form-actions-right">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary">Save Set</button>
        </div>
      </div>
    </form>
  )
}
