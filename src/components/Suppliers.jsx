import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import SupplierForm from './SupplierForm'

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  whatsapp: 'WhatsApp',
  phone: 'Phone',
  tiktok: 'TikTok',
  other: 'Other',
}

export default function Suppliers({ store }) {
  const {
    suppliers,
    expenses: allExpenses,
    fetchSupplierExpenses,
    storageMode,
    updateSupplier,
    addSupplier,
  } = store

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saveError, setSaveError] = useState('')

  const canEdit = storageMode === 'supabase'

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || (s.platform || '').toLowerCase().includes(q)
  })

  useEffect(() => {
    if (!selected) {
      setExpenses([])
      return
    }

    if (storageMode === 'supabase' && selected.id && !String(selected.id).startsWith('vendor-')) {
      setLoadingExpenses(true)
      fetchSupplierExpenses(selected.id)
        .then(setExpenses)
        .finally(() => setLoadingExpenses(false))
      return
    }

    setExpenses(allExpenses.filter((e) => e.vendor === selected.name))
  }, [selected, storageMode, fetchSupplierExpenses, allExpenses])

  useEffect(() => {
    if (selected?.id) {
      const updated = suppliers.find((s) => s.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [suppliers, selected?.id])

  const handleSelect = (supplier) => {
    setSelected(supplier)
    setEditing(false)
    setShowNewForm(false)
  }

  const handleSave = async (data) => {
    setSaveError('')
    try {
      if (selected && editing) {
        await updateSupplier(selected.id, data)
        setEditing(false)
      } else {
        const created = await addSupplier(data)
        setShowNewForm(false)
        setSelected(created)
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save supplier')
    }
  }

  return (
    <div className="customers-page">
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search suppliers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canEdit && (
          <button className="btn-primary" onClick={() => { setShowNewForm(true); setEditing(false); setSelected(null) }}>
            + New Supplier
          </button>
        )}
        <span className="muted">{filtered.length} suppliers</span>
      </div>

      {(showNewForm || editing) && canEdit && (
        <SupplierForm
          supplier={editing ? selected : null}
          onSave={handleSave}
          onCancel={() => { setEditing(false); setShowNewForm(false); setSaveError('') }}
        />
      )}

      {saveError && <div className="banner banner-error">{saveError}</div>}

      <div className="customers-layout">
        <div className="customer-list">
          {filtered.length === 0 && (
            <p className="empty">
              {canEdit
                ? 'No suppliers yet. Click + New Supplier or add one when recording an expense.'
                : 'No suppliers yet.'}
            </p>
          )}
          {filtered.map((s) => (
            <button
              key={s.id}
              className={`customer-card ${selected?.id === s.id ? 'selected' : ''}`}
              onClick={() => handleSelect(s)}
            >
              <div className="customer-avatar supplier-avatar">{s.name.charAt(0).toUpperCase()}</div>
              <div className="customer-info">
                <strong>{s.name}</strong>
                {s.handle && <span className="handle">@{s.handle.replace('@', '')}</span>}
                {s.platform && (
                  <span className="muted">{PLATFORM_LABELS[s.platform] || s.platform}</span>
                )}
                {s.notes && (
                  <span className="muted note-preview">{s.notes.slice(0, 40)}{s.notes.length > 40 ? '…' : ''}</span>
                )}
                <span className="muted">
                  {s.purchaseCount ?? 0} purchase{(s.purchaseCount ?? 0) !== 1 ? 's' : ''} · {formatCurrency(s.totalSpent ?? 0)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {selected && !editing && (
          <div className="customer-detail panel">
            <div className="detail-header">
              <h3>{selected.name}</h3>
              {canEdit && selected.id && (
                <button className="btn-ghost btn-sm" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {selected.handle && <p className="handle-lg">@{selected.handle.replace('@', '')}</p>}
            {selected.platform && (
              <p className="muted">{PLATFORM_LABELS[selected.platform] || selected.platform}</p>
            )}
            {selected.phone && <p className="muted">Phone: {selected.phone}</p>}
            {selected.email && <p className="muted">Email: {selected.email}</p>}

            {selected.notes && (
              <div className="customer-notes">
                <h4>Notes</h4>
                <p>{selected.notes}</p>
              </div>
            )}

            <p className="detail-stat">
              Total spent: <strong>{formatCurrency(selected.totalSpent ?? 0)}</strong>
            </p>

            <h4>Purchase History</h4>
            {loadingExpenses ? (
              <p className="muted">Loading…</p>
            ) : expenses.length === 0 ? (
              <p className="muted">No purchases recorded yet.</p>
            ) : (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.date)}</td>
                      <td>{e.description}</td>
                      <td className="amount expense-color">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
