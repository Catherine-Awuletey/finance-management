import { formatCurrency, formatDate, formatMonth } from '../utils/format'

export default function Dashboard({ store }) {
  const { totalRevenue, totalExpenses, balance, orders, expenses, revenueByMonth, expensesByMonth, setBreakdown, customers } = store

  const months = [...new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)])].sort()
  const recentOrders = [...orders].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5)
  const recentExpenses = [...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5)
  const topSets = Object.entries(setBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxMonthRev = Math.max(...Object.values(revenueByMonth), 1)

  return (
    <div className="dashboard">
      {orders.length === 0 && expenses.length === 0 && (
        <div className="banner banner-info welcome-banner">
          Welcome! Add lash sets under <strong>Inventory</strong>, then record orders under <strong>Orders</strong> or expenses under <strong>Expenses</strong>.
        </div>
      )}
      <div className="stat-grid">
        <div className="stat-card highlight">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">{formatCurrency(totalRevenue)}</span>
          <span className="stat-meta">{orders.length} orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value expense-color">{formatCurrency(totalExpenses)}</span>
          <span className="stat-meta">{expenses.length} purchases</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Balance</span>
          <span className={`stat-value ${balance >= 0 ? 'balance-color' : 'expense-color'}`}>{formatCurrency(balance)}</span>
          <span className="stat-meta">Revenue − expenses</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Customers</span>
          <span className="stat-value">{customers.length}</span>
          <span className="stat-meta">Unique clients</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Monthly Overview</h3>
          <div className="chart-bars">
            {months.map((m) => {
              const rev = revenueByMonth[m] || 0
              const exp = expensesByMonth[m] || 0
              return (
                <div key={m} className="chart-row">
                  <span className="chart-label">{formatMonth(m)}</span>
                  <div className="chart-bar-wrap">
                    <div className="chart-bar revenue-bar" style={{ width: `${(rev / maxMonthRev) * 100}%` }} title={`Revenue: ${formatCurrency(rev)}`} />
                    <div className="chart-bar expense-bar" style={{ width: `${(exp / maxMonthRev) * 100}%` }} title={`Expenses: ${formatCurrency(exp)}`} />
                  </div>
                  <span className="chart-amount">{formatCurrency(rev - exp)}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-legend">
            <span><i className="dot revenue" /> Revenue</span>
            <span><i className="dot expense" /> Expenses</span>
          </div>
        </section>

        <section className="panel">
          <h3>Popular Sets</h3>
          <ul className="set-list">
            {topSets.map(([set, count]) => (
              <li key={set}>
                <span>{set}</span>
                <span className="badge">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Recent Orders</h3>
          <table className="mini-table">
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{formatDate(o.date)}</td>
                  <td>{o.client || o.handle}</td>
                  <td className="amount">{formatCurrency(o.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h3>Recent Expenses</h3>
          <table className="mini-table">
            <tbody>
              {recentExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.vendor}</td>
                  <td className="amount expense-color">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
