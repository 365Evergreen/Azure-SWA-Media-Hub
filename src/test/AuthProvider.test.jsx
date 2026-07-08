import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth.jsx'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockAuthMe(clientPrincipal) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ clientPrincipal }),
  })
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders children', async () => {
    mockAuthMe(null)
    render(
      <MemoryRouter>
        <AuthProvider>
          <div data-testid="child">hello</div>
        </AuthProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('child')).toBeInTheDocument())
  })
})
