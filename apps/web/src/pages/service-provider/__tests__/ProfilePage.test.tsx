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
    id: 'sp-1',
    fullName: 'Bob Builder',
    email: 'bob@example.com',
    phone: '+63 912 000 0000',
    role: 'SERVICE_PROVIDER' as const,
    homeownerProfile: null,
    serviceProviderProfile: {
      businessName: "Bob's Roofing",
      isCompany: false,
      tradeCategories: ['Roofing'],
      serviceCities: [],
      bio: null,
      verified: false,
    },
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

describe('ServiceProviderProfilePage', () => {
  it('renders loading state', () => {
    vi.mocked(useMeQuery).mockReturnValue([{ data: undefined, fetching: true, stale: false, error: undefined }, mockReexecute] as any)
    renderPage()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('pre-fills full name from me query', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Bob Builder')).toBeInTheDocument()
    })
  })

  it('shows "Profile saved." after successful save', async () => {
    renderPage()

    await waitFor(() => screen.getByDisplayValue('Bob Builder'))
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(screen.getByText('Profile saved.')).toBeInTheDocument()
    })
  })

  it('shows error message on mutation failure', async () => {
    mockUpdateProfile.mockResolvedValue({
      data: null,
      error: { message: 'Save failed' },
    })

    renderPage()

    await waitFor(() => screen.getByDisplayValue('Bob Builder'))
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })

  it('Roofing checkbox is pre-checked from profile tradeCategories', async () => {
    renderPage()

    await waitFor(() => screen.getByDisplayValue('Bob Builder'))
    const roofingCheckbox = screen.getByRole('checkbox', { name: /roofing/i })
    expect(roofingCheckbox).toBeChecked()
  })

  it('toggling an unchecked category checks it', async () => {
    renderPage()

    await waitFor(() => screen.getByDisplayValue('Bob Builder'))
    const plumbingCheckbox = screen.getByRole('checkbox', { name: /plumbing/i })
    expect(plumbingCheckbox).not.toBeChecked()

    await userEvent.click(plumbingCheckbox)
    expect(plumbingCheckbox).toBeChecked()
  })
})
