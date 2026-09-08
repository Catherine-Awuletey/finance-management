import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        setShowPassword(false)
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
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {message && <p className={`auth-message ${message.includes('created') ? 'success' : 'error'}`}>{message}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'signin' ? (
            <>No account? <button type="button" className="link-btn" onClick={() => { setMode('signup'); setShowPassword(false) }}>Sign up</button></>
          ) : (
            <>Have an account? <button type="button" className="link-btn" onClick={() => { setMode('signin'); setShowPassword(false) }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
