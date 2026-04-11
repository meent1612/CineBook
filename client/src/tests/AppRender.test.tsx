import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import React from 'react'

// Mock AIChatbot because jsdom doesn't support scrollIntoView
vi.mock('../pages/Aichatbot', () => ({
  default: () => <div data-testid="mock-aichatbot" />,
}))

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