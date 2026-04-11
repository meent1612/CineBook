import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

describe('Public Pages Smoke Test', () => {
  it('Home renders without crashing', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
  })
  it('Login renders without crashing', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
  })
  it('Register renders without crashing', () => {
    render(<MemoryRouter><Register /></MemoryRouter>)
  })
})