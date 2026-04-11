import { render, screen } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

// Case 1: no user → should redirect to /login
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

describe('ProtectedRoute Smoke Test', () => {
  it('redirects to login when user is not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute requiredRole="admin">
          <div>Admin Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    )
    // Admin Page should NOT be visible
    expect(screen.queryByText('Admin Page')).toBeNull()
  })
})