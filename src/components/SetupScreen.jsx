export default function SetupScreen({ onUseLocal }) {
  return (
    <div className="setup-screen">
      <div className="setup-card">
        <span className="brand-icon setup-icon">✦</span>
        <h1>Connect Supabase</h1>
        <p className="setup-lead">
          Supabase is not connected yet. The reload button only works after you create a{' '}
          <code>.env</code> file <strong>and</strong> restart the dev server.
        </p>

        <div className="banner banner-error setup-banner">
          <strong>Why reload didn&apos;t work:</strong> either <code>.env</code> is missing, or{' '}
          <code>npm run dev</code> wasn&apos;t restarted after creating it.
        </div>

        <ol className="setup-steps">
          <li>
            Copy your keys from Supabase → <strong>Project Settings → API</strong>
          </li>
          <li>
            In the <code>Management</code> folder, create a file named <code>.env</code>:
            <pre className="setup-code">{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key

# Project URL only — do NOT add /rest/v1/`}</pre>
          </li>
          <li>
            In your terminal, <strong>stop</strong> the server (<code>Ctrl + C</code>), then:
            <pre className="setup-code">npm run dev</pre>
          </li>
          <li>
            Open <code>http://localhost:5173</code> — you should see the <strong>Sign in</strong> screen
          </li>
        </ol>

        <div className="setup-actions">
          <button className="btn-ghost" onClick={onUseLocal}>
            Continue offline (localStorage)
          </button>
        </div>

        <p className="setup-note muted">
          Tip: use the <strong>anon public</strong> key, not the service_role key.
        </p>
      </div>
    </div>
  )
}
