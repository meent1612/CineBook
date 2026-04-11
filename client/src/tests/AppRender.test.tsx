import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock useAuth so App doesn't crash without a real backend
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import App from '../App'

describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    render(<App />)
  })
})