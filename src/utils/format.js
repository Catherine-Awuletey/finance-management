export function formatCurrency(amount) {
  return `₵${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function toInputDate(dateStr) {
  return dateStr || ''
}

export function exportCSV(orders, expenses) {
  const orderRows = [
    ['Type', 'Date', 'Client', 'Handle', 'Set', 'Mapping', 'Amount', 'Period', 'Notes'],
    ...orders.map((o) => ['Order', o.date, o.client, o.handle, o.set, o.mapping, o.amount, o.period, o.notes || '']),
  ]
  const expenseRows = expenses.map((e) => ['Expense', e.date, '', '', e.vendor, e.description, e.amount, e.period, e.notes || ''])
  const rows = [...orderRows, ...expenseRows]
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lash-finance-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
