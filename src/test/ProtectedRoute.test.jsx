import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockAuthMe(clientPrincipal) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ clientPrincipal }),
  })
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('redirects to /login when not authenticated', async () => {
    mockAuthMe(null) // not logged in

    render(
      <MemoryRouter initialEntries={['/media']}>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected">secret</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    )

    // While loading, shows spinner
    expect(screen.getByRole('status')).toBeInTheDocument()

    // After auth check completes, the protected content is NOT shown
    await waitFor(() => {
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
    })
  })

  it('renders children when authenticated', async () => {
    mockAuthMe({ userId: 'u1', userDetails: 'test@example.com', identityProvider: 'aad' })

    render(
      <MemoryRouter initialEntries={['/media']}>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected">secret</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeInTheDocument()
    })
  })
})
