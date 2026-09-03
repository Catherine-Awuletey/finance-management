import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import InventoryForm from './InventoryForm'

export default function Inventory({ store }) {
  const {
    inventory,
    fetchInventoryOrders,
    storageMode,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = store

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saveError, setSaveError] = useState('')

  const canEdit = storageMode === 'supabase'

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase()
    return !q || item.name.toLowerCase().includes(q) || (item.mapping || '').toLowerCase().includes(q)
  })

  useEffect(() => {
    if (!selected) {
      setOrders([])
      return
    }

    if (storageMode === 'supabase' && selected.id) {
      setLoadingOrders(true)
      fetchInventoryOrders(selected.name)
        .then(setOrders)
        .finally(() => setLoadingOrders(false))
      return
    }

    setOrders([])
  }, [selected, storageMode, fetchInventoryOrders])

  useEffect(() => {
    if (selected?.id) {
      const updated = inventory.find((i) => i.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [inventory, selected?.id])

  const handleSelect = (item) => {
    setSelected(item)
    setEditing(false)
    setShowNewForm(false)
  }

  const handleSave = async (data) => {
    setSaveError('')
    try {
      if (selected && editing) {
        await updateInventoryItem(selected.id, data)
        setEditing(false)
      } else {
        const created = await addInventoryItem(data)
        setShowNewForm(false)
        setSelected(created)
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save set')
    }
  }

  const handleDelete = async (id) => {
    setSaveError('')
    try {
      await deleteInventoryItem(id)
      setEditing(false)
      setSelected(null)
    } catch (err) {
      setSaveError(err.message || 'Failed to delete set')
    }
  }

  return (
    <div className="customers-page">
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search sets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canEdit && (
          <button className="btn-primary" onClick={() => { setShowNewForm(true); setEditing(false); setSelected(null) }}>
            + New Set
          </button>
        )}
        <span className="muted">{filtered.length} sets</span>
      </div>

      {(showNewForm || editing) && canEdit && (
        <InventoryForm
          item={editing ? selected : null}
          onSave={handleSave}
          onCancel={() => { setEditing(false); setShowNewForm(false); setSaveError('') }}
          onDelete={editing ? handleDelete : undefined}
        />
      )}

      {saveError && <div className="banner banner-error">{saveError}</div>}

      <div className="customers-layout">
        <div className="customer-list">
          {filtered.length === 0 && (
            <p className="empty">
              {canEdit
                ? 'No sets yet. Add your lash styles here — they’ll appear when creating orders.'
                : 'No sets yet.'}
            </p>
          )}
          {filtered.map((item) => (
            <button
              key={item.id}
              className={`customer-card ${selected?.id === item.id ? 'selected' : ''}`}
              onClick={() => handleSelect(item)}
            >
              <div className="customer-avatar inventory-avatar">{item.name.charAt(0).toUpperCase()}</div>
              <div className="customer-info">
                <strong>{item.name}</strong>
                {item.mapping && <span className="muted">{item.mapping}</span>}
                {item.price > 0 && <span className="muted">{formatCurrency(item.price)} default</span>}
                {item.notes && (
                  <span className="muted note-preview">{item.notes.slice(0, 40)}{item.notes.length > 40 ? '…' : ''}</span>
                )}
                <span className="muted">
                  {item.orderCount ?? 0} order{(item.orderCount ?? 0) !== 1 ? 's' : ''} · {formatCurrency(item.totalRevenue ?? 0)}
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

            {selected.mapping && <p className="muted">Mapping: {selected.mapping}</p>}
            {selected.price > 0 && <p className="muted">Default price: {formatCurrency(selected.price)}</p>}

            {selected.notes && (
              <div className="customer-notes">
                <h4>Notes</h4>
                <p>{selected.notes}</p>
              </div>
            )}

            <p className="detail-stat">
              Total revenue: <strong>{formatCurrency(selected.totalRevenue ?? 0)}</strong>
            </p>

            <h4>Order History</h4>
            {loadingOrders ? (
              <p className="muted">Loading…</p>
            ) : orders.length === 0 ? (
              <p className="muted">No orders for this set yet.</p>
            ) : (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{formatDate(o.date)}</td>
                      <td>{o.client || o.handle || '—'}</td>
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
