import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import React from 'react'
import App from '../App'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    render(<App />)
  })
})