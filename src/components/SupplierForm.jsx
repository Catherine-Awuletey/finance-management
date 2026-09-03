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

export default function SupplierForm({ supplier, onSave, onCancel }) {
  const [form, setForm] = useState(supplier ? { ...empty, ...supplier } : empty)

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

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{supplier ? 'Edit Supplier' : 'New Supplier'}</h3>
      <div className="form-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="e.g. Bibibeauty"
          />
        </label>
        <label>
          Handle / username
          <input
            value={form.handle}
            onChange={(e) => set('handle', e.target.value)}
            placeholder="Instagram, shop handle, etc."
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
            placeholder="vendor@email.com"
          />
        </label>
        <label className="full">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="What they sell, delivery times, account details…"
            rows={3}
          />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Supplier</button>
      </div>
    </form>
  )
}
