import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ProfilePage from '../ProfilePage'

const { mockUpdateProfile, mockReexecute } = vi.hoisted(() => ({
  mockUpdateProfile: vi.fn(),
  mockReexecute: vi.fn(),
}))

const mockMeData = {
  me: {
    id: 'user-1',
    fullName: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+63 912 000 0000',
    role: 'HOMEOWNER' as const,
    homeownerProfile: {
      address: '123 Rizal St',
      region: null,
      province: null,
      cityMunicipality: null,
      barangay: null,
    },
    serviceProviderProfile: null,
  },
}

vi.mock('@/generated/graphql', () => ({
  useMeQuery: vi.fn(),
  useUpdateProfileMutation: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ appUser: null, session: null, loading: false, signOut: vi.fn(), setAppUser: vi.fn() }),
}))

import { useMeQuery, useUpdateProfileMutation } from '@/generated/graphql'

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useMeQuery).mockReturnValue([{ data: mockMeData, fetching: false, stale: false, error: undefined }, mockReexecute] as any)
  vi.mocked(useUpdateProfileMutation).mockReturnValue([undefined, mockUpdateProfile] as any)
  mockUpdateProfile.mockResolvedValue({ data: {}, error: null })
})

describe('HomeownerProfilePage', () => {
  it('renders loading state', () => {
    vi.mocked(useMeQuery).mockReturnValue([{ data: undefined, fetching: true, stale: false, error: undefined }, mockReexecute] as any)
    renderPage()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('pre-fills full name from me query result', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice Smith')).toBeInTheDocument()
    })
  })

  it('shows "Profile saved." after successful save', async () => {
    renderPage()

    await waitFor(() => screen.getByDisplayValue('Alice Smith'))
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(screen.getByText('Profile saved.')).toBeInTheDocument()
    })
  })

  it('shows error message on mutation failure', async () => {
    mockUpdateProfile.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    })

    renderPage()

    await waitFor(() => screen.getByDisplayValue('Alice Smith'))
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })
})
