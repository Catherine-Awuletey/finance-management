import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFinanceStore } from './hooks/useFinanceStore'
import { isSupabaseConfigured } from './lib/supabase'
import Dashboard from './components/Dashboard'
import Orders from './components/Orders'
import Expenses from './components/Expenses'
import Customers from './components/Customers'
import Suppliers from './components/Suppliers'
import Inventory from './components/Inventory'
import SetupScreen from './components/SetupScreen'
import AuthScreen from './components/AuthScreen'
import { exportCSV } from './utils/format'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'orders', label: 'Orders', icon: '✦' },
  { id: 'expenses', label: 'Expenses', icon: '↓' },
  { id: 'customers', label: 'Customers', icon: '♡' },
  { id: 'suppliers', label: 'Suppliers', icon: '◎' },
  { id: 'inventory', label: 'Inventory', icon: '◇' },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const auth = useAuth()
  const store = useFinanceStore(isSupabaseConfigured ? auth.isAuthenticated : true)

  if (!store.isSupabaseConfigured && store.storageMode !== 'local') {
    return <SetupScreen onUseLocal={() => store.loadFromLocal()} />
  }

  if (store.isSupabaseConfigured && auth.loading) {
    return (
      <div className="loading-screen">
        <span className="brand-icon">✦</span>
        <p>Loading…</p>
      </div>
    )
  }

  if (store.isSupabaseConfigured && !auth.isAuthenticated) {
    return <AuthScreen onSignIn={auth.signIn} onSignUp={auth.signUp} />
  }

  const businessName = auth.profile?.businessName || 'My Business'
  const businessHandle = auth.profile?.businessHandle || ''

  if (store.loading) {
    return (
      <div className="loading-screen">
        <span className="brand-icon">✦</span>
        <p>Loading your finances…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <div>
            <h1>{businessName}</h1>
            {businessHandle && <p>@{businessHandle.replace('@', '')}</p>}
          </div>
        </div>

        <nav className="nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {auth.isAuthenticated && (
            <button className="btn-ghost muted" onClick={auth.signOut}>
              Sign out
            </button>
          )}
          <button className="btn-ghost" onClick={() => exportCSV(store.orders, store.expenses)}>
            Export CSV
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h2>{TABS.find((t) => t.id === tab)?.label}</h2>
          <div className="topbar-stats">
            <span className="pill revenue">Revenue {formatShort(store.totalRevenue)}</span>
            <span className="pill expense">Spent {formatShort(store.totalExpenses)}</span>
            <span className="pill balance">Balance {formatShort(store.balance)}</span>
          </div>
        </header>

        <div className="content">
          {store.error && (
            <div className="banner banner-error">
              {store.error}
              <button className="btn-ghost btn-sm" onClick={store.loadFromSupabase}>Retry</button>
            </div>
          )}

          {tab === 'dashboard' && <Dashboard store={store} />}
          {tab === 'orders' && <Orders store={store} />}
          {tab === 'expenses' && <Expenses store={store} />}
          {tab === 'customers' && <Customers store={store} />}
          {tab === 'suppliers' && <Suppliers store={store} />}
          {tab === 'inventory' && <Inventory store={store} />}
        </div>
      </main>
    </div>
  )
}

function formatShort(n) {
  return `₵${Number(n).toLocaleString('en-GH')}`
}
