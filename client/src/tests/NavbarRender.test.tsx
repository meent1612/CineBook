import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

describe('Navbar Smoke Test', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
  })
})