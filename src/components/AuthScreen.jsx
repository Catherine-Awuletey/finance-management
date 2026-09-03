import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessHandle, setBusinessHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (mode === 'signup') {
        if (!businessName.trim()) {
          setMessage('Please enter your business name')
          setLoading(false)
          return
        }
        await onSignUp(email, password, {
          businessName: businessName.trim(),
          businessHandle: businessHandle.trim(),
        })
        setMessage('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        await onSignIn(email, password)
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <span className="brand-icon setup-icon">✦</span>
        <h1>{mode === 'signup' ? 'Create your account' : 'Sign in'}</h1>
        <p className="setup-lead">
          Track orders, expenses, customers, and suppliers for your lash business.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <label>
                Business name
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="e.g. Lash Finance"
                />
              </label>
              <label>
                Business handle
                <input
                  value={businessHandle}
                  onChange={(e) => setBusinessHandle(e.target.value)}
                  placeholder="e.g. CharmMeUp"
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="At least 6 characters"
            />
          </label>

          {message && <p className={`auth-message ${message.includes('created') ? 'success' : 'error'}`}>{message}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'signin' ? (
            <>No account? <button type="button" className="link-btn" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Have an account? <button type="button" className="link-btn" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
