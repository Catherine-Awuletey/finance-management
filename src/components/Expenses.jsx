import { useState } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import ExpenseForm from './ExpenseForm'

export default function Expenses({ store }) {
  const { expenses, suppliers, deleteExpense, addExpense, updateExpense } = store
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState(null)

  const filtered = expenses
    .filter((e) => {
      const q = search.toLowerCase()
      return !q || [e.vendor, e.description, e.period, e.notes].some((f) => (f || '').toLowerCase().includes(q))
    })
    .sort((a, b) => (b.date || '0000').localeCompare(a.date || '0000'))

  const handleSave = async (data) => {
    try {
      if (editExpense) {
        await updateExpense(editExpense.id, data)
        setEditExpense(null)
      } else {
        await addExpense(data)
      }
      setShowForm(false)
    } catch (err) {
      alert(err.message || 'Failed to save expense')
    }
  }

  const byVendor = filtered.reduce((map, e) => {
    map[e.vendor] = (map[e.vendor] || 0) + e.amount
    return map
  }, {})

  return (
    <div>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search vendor, description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => { setEditExpense(null); setShowForm(true) }}>
          + New Expense
        </button>
      </div>

      {(showForm || editExpense) && (
        <ExpenseForm
          expense={editExpense}
          suppliers={suppliers}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditExpense(null) }}
        />
      )}

      <div className="vendor-chips">
        {Object.entries(byVendor)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([vendor, total]) => (
            <span key={vendor} className="chip">{vendor}: {formatCurrency(total)}</span>
          ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Period</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.date)}</td>
                <td>{e.vendor}</td>
                <td className="desc-cell">
                  {e.description}
                  {e.notes && <span className="note">{e.notes}</span>}
                </td>
                <td className="amount expense-color">{formatCurrency(e.amount)}</td>
                <td className="muted">{e.period}</td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => setEditExpense(e)} title="Edit">✎</button>
                  <button className="btn-icon danger" onClick={() => deleteExpense(e.id)} title="Delete">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="empty">No expenses found.</p>}
      </div>
    </div>
  )
}
