import { useMemo, useState } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import OrderForm from './OrderForm'

export default function Orders({ store }) {
  const { orders, inventory, deleteOrder, addOrder, updateOrder } = store
  const [search, setSearch] = useState('')
  const [filterSet, setFilterSet] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editOrder, setEditOrder] = useState(null)

  const setOptions = useMemo(() => {
    const names = new Set(inventory.map((i) => i.name).filter(Boolean))
    orders.forEach((o) => { if (o.set) names.add(o.set) })
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [inventory, orders])

  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase()
      const matchSearch = !q || [o.client, o.handle, o.set, o.mapping, o.period].some((f) => (f || '').toLowerCase().includes(q))
      const matchSet = !filterSet || o.set === filterSet
      return matchSearch && matchSet
    })
    .sort((a, b) => (b.date || '0000').localeCompare(a.date || '0000'))

  const handleSave = async (data) => {
    try {
      if (editOrder) {
        await updateOrder(editOrder.id, data)
        setEditOrder(null)
      } else {
        await addOrder(data)
      }
      setShowForm(false)
    } catch (err) {
      alert(err.message || 'Failed to save order')
    }
  }

  return (
    <div>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search client, handle, set…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterSet} onChange={(e) => setFilterSet(e.target.value)}>
          <option value="">All sets</option>
          {setOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={() => { setEditOrder(null); setShowForm(true) }}>
          + New Order
        </button>
      </div>

      {(showForm || editOrder) && (
        <OrderForm
          order={editOrder}
          inventory={inventory}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditOrder(null) }}
        />
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Handle</th>
              <th>Set</th>
              <th>Mapping</th>
              <th>Amount</th>
              <th>Period</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{formatDate(o.date)}</td>
                <td>{o.client || '—'}</td>
                <td className="handle-cell">{o.handle ? `@${o.handle.replace('@', '')}` : '—'}</td>
                <td><span className="tag">{o.set || '—'}</span></td>
                <td className="mapping-cell">{o.mapping || '—'}</td>
                <td className="amount">{formatCurrency(o.amount)}</td>
                <td className="muted">{o.period}</td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => setEditOrder(o)} title="Edit">✎</button>
                  <button className="btn-icon danger" onClick={() => deleteOrder(o.id)} title="Delete">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="empty">No orders found.</p>}
      </div>
    </div>
  )
}
