import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import AppLayout from './AppLayout'

const mockUseAuth = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderAppLayout(initialPath = '/homeowner') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/homeowner" element={<div>Homeowner content</div>} />
          <Route path="/service-provider" element={<div>Service Provider content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('AppLayout', () => {
  it('renders nothing while loading', () => {
    mockUseAuth.mockReturnValue({ loading: true, session: null, appUser: null, signOut: vi.fn() })
    const { container } = renderAppLayout()
    expect(container.firstChild).toBeNull()
  })

  it('redirects to /login when there is no session', () => {
    mockUseAuth.mockReturnValue({ loading: false, session: null, appUser: null, signOut: vi.fn() })
    renderAppLayout()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the outlet when authenticated', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { access_token: 'tok' },
      appUser: { id: '1', email: 'a@b.com', role: 'HOMEOWNER', fullName: 'Alice' },
      signOut: vi.fn(),
    })
    renderAppLayout('/homeowner')
    expect(screen.getByText('Homeowner content')).toBeInTheDocument()
  })

  it('shows Dashboard nav link for HOMEOWNER', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { access_token: 'tok' },
      appUser: { id: '1', email: 'a@b.com', role: 'HOMEOWNER', fullName: 'Alice' },
      signOut: vi.fn(),
    })
    renderAppLayout('/homeowner')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('shows Browse Jobs nav link for SERVICE_PROVIDER', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { access_token: 'tok' },
      appUser: { id: '2', email: 'b@b.com', role: 'SERVICE_PROVIDER', fullName: 'Bob' },
      signOut: vi.fn(),
    })
    renderAppLayout('/service-provider')
    expect(screen.getByRole('link', { name: 'Browse Jobs' })).toBeInTheDocument()
  })
})
