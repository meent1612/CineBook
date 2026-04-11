import { render, screen } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

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
    expect(screen.queryByText('Admin Page')).toBeNull()
  })
})