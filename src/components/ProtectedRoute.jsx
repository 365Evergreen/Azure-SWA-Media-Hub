import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

/**
 * ProtectedRoute – redirects to /login when the user is not authenticated.
 * Shows a loading spinner while the auth state is being determined.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-label="Checking authentication">
        <span className="spinner" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
