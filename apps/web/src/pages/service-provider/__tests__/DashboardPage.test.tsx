import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import DashboardPage from '../DashboardPage'

vi.mock('@/generated/graphql', () => ({
  useJobPostsQuery: vi.fn(),
  useMyBidsQuery: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    appUser: { id: 'sp-1', fullName: 'Bob Builder', email: 'bob@example.com', role: 'SERVICE_PROVIDER' },
    session: null,
    loading: false,
    signOut: vi.fn(),
    setAppUser: vi.fn(),
  }),
}))

import { useJobPostsQuery, useMyBidsQuery } from '@/generated/graphql'

const mockJob = {
  id: 'job-1',
  title: 'Fix leaking pipe',
  category: 'Plumbing',
  bidCount: 2,
  cityMunicipality: 'Taguig',
  province: 'Metro Manila',
  createdAt: '2024-01-15T00:00:00.000Z',
}

const mockBid = {
  id: 'bid-1',
  jobPostId: 'job-1',
  status: 'PENDING' as const,
  createdAt: '2024-01-16T00:00:00.000Z',
  jobPost: {
    id: 'job-1',
    title: 'Fix leaking pipe',
    category: 'Plumbing',
    cityMunicipality: 'Taguig',
    province: 'Metro Manila',
  },
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useJobPostsQuery).mockReturnValue([{ data: { jobPosts: [] }, fetching: false, stale: false, error: undefined }] as any)
  vi.mocked(useMyBidsQuery).mockReturnValue([{ data: { myBids: [] }, fetching: false, stale: false, error: undefined }] as any)
})

describe('ServiceProviderDashboard', () => {
  it('renders welcome message with fullName', () => {
    renderPage()
    expect(screen.getByText('Welcome, Bob Builder')).toBeInTheDocument()
  })

  it('renders "No open jobs" empty state when jobPosts is empty', () => {
    renderPage()
    expect(screen.getByText('No open jobs right now. Check back soon.')).toBeInTheDocument()
  })

  it('renders job card with title and category', () => {
    vi.mocked(useJobPostsQuery).mockReturnValue([{ data: { jobPosts: [mockJob] }, fetching: false, stale: false, error: undefined }] as any)
    renderPage()
    expect(screen.getByText('Fix leaking pipe')).toBeInTheDocument()
    // "Plumbing" appears both in the category filter and in the job card — confirm both are present
    expect(screen.getAllByText('Plumbing').length).toBeGreaterThanOrEqual(2)
  })

  it('renders my bids section with bid status', () => {
    vi.mocked(useMyBidsQuery).mockReturnValue([{ data: { myBids: [mockBid] }, fetching: false, stale: false, error: undefined }] as any)
    renderPage()
    expect(screen.getByText('My bids')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders "You haven\'t placed any bids yet" when myBids is empty', () => {
    renderPage()
    expect(screen.getByText("You haven't placed any bids yet.")).toBeInTheDocument()
  })
})
