import { useState } from 'react'

const PLATFORMS = [
  { value: '', label: 'Not set' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'other', label: 'Other' },
]

const empty = {
  name: '',
  handle: '',
  platform: '',
  phone: '',
  email: '',
  notes: '',
}

export default function CustomerForm({ customer, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(customer ? { ...empty, ...customer } : empty)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      handle: (form.handle || '').trim().replace(/^@/, ''),
    })
  }

  const handleDelete = () => {
    const orderNote = customer?.orderCount > 0
      ? `\n\nTheir ${customer.orderCount} order(s) will stay in Orders — only the customer contact is removed.`
      : ''
    if (confirm(`Delete ${customer.name}? This cannot be undone.${orderNote}`)) {
      onDelete(customer.id)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{customer ? 'Edit Customer' : 'New Customer'}</h3>
      <div className="form-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Client name"
          />
        </label>
        <label>
          Handle / username
          <input
            value={form.handle}
            onChange={(e) => set('handle', e.target.value)}
            placeholder="Instagram, Snap, etc."
          />
        </label>
        <label>
          Platform
          <select value={form.platform} onChange={(e) => set('platform', e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <label>
          Phone
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="027… or WhatsApp number"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="client@email.com"
          />
        </label>
        <label className="full">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Preferences, delivery info, favourite sets…"
            rows={3}
          />
        </label>
      </div>
      <div className="form-actions">
        {customer && onDelete && (
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Delete customer
          </button>
        )}
        <div className="form-actions-right">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary">Save Customer</button>
        </div>
      </div>
    </form>
  )
}
