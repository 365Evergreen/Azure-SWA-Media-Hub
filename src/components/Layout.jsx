import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <Link to="/media" className="logo">
            <span className="logo-icon" aria-hidden="true">🎬</span>
            <span>Azure Media Hub</span>
          </Link>
          <nav className="nav" aria-label="Main navigation">
            <Link to="/media" className="nav-link">Library</Link>
          </nav>
          <div className="header-user">
            {user && (
              <>
                <span className="user-name" title={user.userDetails}>
                  {user.userDetails}
                </span>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Azure Media Hub &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
