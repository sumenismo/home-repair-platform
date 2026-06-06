import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AuthProvider, useAuth } from './AuthContext'

const { mockGetSession, mockOnAuthStateChange, mockSignOut } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  },
}))

function makeSubscription() {
  return { data: { subscription: { unsubscribe: vi.fn() } } }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockOnAuthStateChange.mockReturnValue(makeSubscription())
})

function TestConsumer() {
  const { session, appUser, loading } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="session">{session ? 'has-session' : 'no-session'}</span>
      <span data-testid="appUser">{appUser ? appUser.email : 'no-user'}</span>
    </div>
  )
}

function SignOutButton() {
  const { signOut } = useAuth()
  return <button onClick={signOut}>Sign out</button>
}

describe('AuthContext', () => {
  it('starts with loading true then resolves to false', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('loading').textContent).toBe('true')

    await act(async () => {})
    expect(screen.getByTestId('loading').textContent).toBe('false')
  })

  it('populates session from getSession', async () => {
    const fakeSession = { access_token: 'tok', user: { id: 'u1' } }
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } })

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>,
    )

    await act(async () => {})
    expect(screen.getByTestId('session').textContent).toBe('has-session')
  })

  it('signOut calls supabase.auth.signOut and clears appUser', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockSignOut.mockResolvedValue({})

    render(
      <MemoryRouter>
        <AuthProvider>
          <SignOutButton />
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>,
    )

    await act(async () => {})
    await userEvent.click(screen.getByText('Sign out'))

    expect(mockSignOut).toHaveBeenCalledOnce()
    expect(screen.getByTestId('appUser').textContent).toBe('no-user')
  })

  it('useAuth throws when used outside AuthProvider', () => {
    function Bare() {
      useAuth()
      return null
    }
    expect(() => render(<Bare />)).toThrow('useAuth must be used within AuthProvider')
  })
})
