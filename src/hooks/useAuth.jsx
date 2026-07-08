/**
 * useAuth – Azure Static Web Apps built-in authentication hook.
 *
 * Azure SWA exposes:
 *   GET /.auth/me          → returns current user info (or empty array when not logged in)
 *   GET /.auth/login/{provider}?post_login_redirect_uri=<url>   → initiate login
 *   GET /.auth/logout?post_logout_redirect_uri=<url>            → logout
 *
 * Supported providers (configured in staticwebapp.config.json):
 *   aad (Microsoft Entra ID), github, google, twitter
 */

import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

async function fetchAuthMe() {
  const res = await fetch('/.auth/me')
  if (!res.ok) return null
  const data = await res.json()
  // SWA returns { clientPrincipal: { ... } } or { clientPrincipal: null }
  return data?.clientPrincipal ?? null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = not authed
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuthMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  function login(provider = 'aad') {
    const returnUrl = encodeURIComponent(window.location.pathname)
    window.location.href = `/.auth/login/${provider}?post_login_redirect_uri=${returnUrl}`
  }

  function logout() {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/'
  }

  const value = { user, loading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
