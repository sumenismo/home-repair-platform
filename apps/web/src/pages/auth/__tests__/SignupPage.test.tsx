import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import SignupPage from '../SignupPage'

const { mockSignUp, mockSetAppUser, mockRegisterUser } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockSetAppUser: vi.fn(),
  mockRegisterUser: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
    },
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    setAppUser: mockSetAppUser,
    session: null,
    appUser: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('@/generated/graphql', () => ({
  useRegisterUserMutation: () => [undefined, mockRegisterUser],
}))

function renderSignupPage() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/homeowner" element={<div>Homeowner dashboard</div>} />
        <Route path="/service-provider" element={<div>Service Provider dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSignUp.mockResolvedValue({ data: { session: null }, error: null })
})

describe('SignupPage', () => {
  it('shows validation errors when submitted empty', async () => {
    renderSignupPage()
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      expect(screen.getByText('Please select a role')).toBeInTheDocument()
    })
  })

  it('role toggle buttons update the selected role', async () => {
    renderSignupPage()

    const serviceProviderBtn = screen.getByRole('button', { name: 'Service Provider' })
    await userEvent.click(serviceProviderBtn)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Bob Builder')
    await userEvent.type(screen.getByLabelText(/email/i), 'bob@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.queryByText('Please select a role')).not.toBeInTheDocument()
    })
  })

  it('shows error when Supabase sign-up fails', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null },
      error: { message: 'Email already in use' },
    })

    renderSignupPage()
    await userEvent.type(screen.getByLabelText(/full name/i), 'Alice Smith')
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Homeowner' }))
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument()
    })
  })

  it('calls setAppUser and navigates to /service-provider on successful SERVICE_PROVIDER signup', async () => {
    const fakeUser = {
      id: 'u2',
      email: 'bob@example.com',
      role: 'SERVICE_PROVIDER',
      fullName: 'Bob',
    }
    mockSignUp.mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null })
    mockRegisterUser.mockResolvedValue({ data: { registerUser: fakeUser }, error: null })

    renderSignupPage()
    await userEvent.type(screen.getByLabelText(/full name/i), 'Bob Builder')
    await userEvent.type(screen.getByLabelText(/email/i), 'bob@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Service Provider' }))
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockSetAppUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'SERVICE_PROVIDER' }),
      )
      expect(screen.getByText('Service Provider dashboard')).toBeInTheDocument()
    })
  })
})
