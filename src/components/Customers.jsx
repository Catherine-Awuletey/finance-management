import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import CustomerForm from './CustomerForm'

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  whatsapp: 'WhatsApp',
  phone: 'Phone',
  tiktok: 'TikTok',
  other: 'Other',
}

export default function Customers({ store }) {
  const {
    customers,
    fetchCustomerOrders,
    storageMode,
    orders,
    updateCustomer,
    addCustomer,
    deleteCustomer,
  } = store

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saveError, setSaveError] = useState('')

  const canEdit = storageMode === 'supabase'

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || (c.handle || '').toLowerCase().includes(q)
  })

  useEffect(() => {
    if (!selected) {
      setCustomerOrders([])
      return
    }

    if (storageMode === 'supabase' && selected.id && !String(selected.id).includes('|')) {
      setLoadingOrders(true)
      fetchCustomerOrders(selected.id)
        .then(setCustomerOrders)
        .finally(() => setLoadingOrders(false))
      return
    }

    setCustomerOrders(selected.orders || orders.filter((o) =>
      (o.client || o.handle) === selected.name || o.handle === selected.handle
    ))
  }, [selected, storageMode, fetchCustomerOrders, orders])

  // Keep selected in sync after edits
  useEffect(() => {
    if (selected?.id) {
      const updated = customers.find((c) => c.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [customers, selected?.id])

  const displayOrders = customerOrders.length ? customerOrders : (selected?.orders || [])
  const totalSpent = selected?.totalSpent ?? displayOrders.reduce((s, o) => s + (o.amount || 0), 0)

  const handleSave = async (data) => {
    setSaveError('')
    try {
      if (selected && editing) {
        await updateCustomer(selected.id, data)
        setEditing(false)
      } else {
        const created = await addCustomer(data)
        setShowNewForm(false)
        setSelected(created)
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save customer')
    }
  }

  const handleDelete = async (id) => {
    setSaveError('')
    try {
      await deleteCustomer(id)
      setEditing(false)
      setSelected(null)
    } catch (err) {
      setSaveError(err.message || 'Failed to delete customer')
    }
  }

  return (
    <div className="customers-page">
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canEdit && (
          <button className="btn-primary" onClick={() => { setShowNewForm(true); setEditing(false); setSelected(null) }}>
            + New Customer
          </button>
        )}
        <span className="muted">{filtered.length} customers</span>
      </div>

      {(showNewForm || editing) && canEdit && (
        <CustomerForm
          customer={editing ? selected : null}
          onSave={handleSave}
          onCancel={() => { setEditing(false); setShowNewForm(false); setSaveError('') }}
          onDelete={editing ? handleDelete : undefined}
        />
      )}

      {saveError && <div className="banner banner-error">{saveError}</div>}

      <div className="customers-layout">
        <div className="customer-list">
          {filtered.map((c) => (
            <button
              key={c.id || c.name + c.handle}
              className={`customer-card ${selected?.id === c.id ? 'selected' : ''}`}
              onClick={() => { setSelected(c); setEditing(false); setShowNewForm(false) }}
            >
              <div className="customer-avatar">{c.name.charAt(0).toUpperCase()}</div>
              <div className="customer-info">
                <strong>{c.name}</strong>
                {c.handle && <span className="handle">@{c.handle.replace('@', '')}</span>}
                {c.notes && <span className="muted note-preview">{c.notes.slice(0, 40)}{c.notes.length > 40 ? '…' : ''}</span>}
                <span className="muted">
                  {c.orderCount ?? c.orders?.length ?? 0} order{(c.orderCount ?? c.orders?.length ?? 0) !== 1 ? 's' : ''} · {formatCurrency(c.totalSpent ?? 0)}
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
            {selected.platform && PLATFORM_LABELS[selected.platform] && (
              <p className="muted">{PLATFORM_LABELS[selected.platform]}</p>
            )}
            {selected.phone && <p className="muted">Phone: {selected.phone}</p>}
            {selected.email && <p className="muted">Email: {selected.email}</p>}

            {selected.notes && (
              <div className="customer-notes">
                <h4>Notes</h4>
                <p>{selected.notes}</p>
              </div>
            )}

            <p className="detail-stat">Total spent: <strong>{formatCurrency(totalSpent)}</strong></p>

            <h4>Order History</h4>
            {loadingOrders ? (
              <p className="muted">Loading…</p>
            ) : displayOrders.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Set</th>
                    <th>Mapping</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[...displayOrders]
                    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                    .map((o) => (
                      <tr key={o.id}>
                        <td>{formatDate(o.date)}</td>
                        <td>{o.set}</td>
                        <td>{o.mapping || '—'}</td>
                        <td className="amount">{formatCurrency(o.amount)}</td>
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
