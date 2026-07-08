import { useAuth } from '../hooks/useAuth.jsx'
import './LoginPage.css'

const PROVIDERS = [
  { id: 'aad', label: 'Sign in with Microsoft', icon: '🏢' },
  { id: 'github', label: 'Sign in with GitHub', icon: '🐙' },
  { id: 'google', label: 'Sign in with Google', icon: '🔵' },
]

/**
 * LoginPage – displays authentication options.
 * Azure SWA handles the actual OAuth flow via /.auth/login/{provider}.
 */
export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" aria-hidden="true">🎬</div>
        <h1 className="login-title">Azure Media Hub</h1>
        <p className="login-subtitle">Sign in to access your media library</p>

        <div className="login-providers">
          {PROVIDERS.map(({ id, label, icon }) => (
            <button
              key={id}
              className="btn-provider"
              onClick={() => login(id)}
              aria-label={label}
            >
              <span className="provider-icon" aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
