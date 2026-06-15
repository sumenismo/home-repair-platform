import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import LoginPage from '../LoginPage'

const { mockSignInWithPassword, mockGqlQuery, mockSetAppUser, mockSignOut } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockGqlQuery: vi.fn(),
  mockSetAppUser: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  },
}))

vi.mock('@/lib/gql-client', () => ({
  gqlClient: {
    query: mockGqlQuery,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    setAppUser: mockSetAppUser,
    session: null,
    appUser: null,
    loading: false,
    signOut: mockSignOut,
  }),
}))

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/homeowner" element={<div>Homeowner dashboard</div>} />
        <Route path="/service-provider" element={<div>Service Provider dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('shows validation errors when submitted empty', async () => {
    renderLoginPage()
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('shows a server error when Supabase returns an error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('shows error when me query returns null (account not found)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'tok' } },
      error: null,
    })
    mockGqlQuery.mockReturnValue({ toPromise: () => Promise.resolve({ data: { me: null } }) })
    mockSignOut.mockResolvedValue({})

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/account not found/i)).toBeInTheDocument()
    })
  })

  it('calls setAppUser and navigates to /homeowner on successful HOMEOWNER login', async () => {
    const fakeUser = { id: 'u1', email: 'user@example.com', role: 'HOMEOWNER', fullName: 'Alice' }
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'tok' } },
      error: null,
    })
    mockGqlQuery.mockReturnValue({
      toPromise: () => Promise.resolve({ data: { me: fakeUser } }),
    })

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSetAppUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'HOMEOWNER' }))
      expect(screen.getByText('Homeowner dashboard')).toBeInTheDocument()
    })
  })
})
