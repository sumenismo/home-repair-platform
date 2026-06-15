import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import JobDetailPage from '../JobDetailPage'

const { mockAcceptBid, mockRejectBid, mockClosePost, mockRefetchBids } = vi.hoisted(() => ({
  mockAcceptBid: vi.fn(),
  mockRejectBid: vi.fn(),
  mockClosePost: vi.fn(),
  mockRefetchBids: vi.fn(),
}))

const mockPost = {
  id: 'post-1',
  title: 'Fix leaking roof',
  category: 'Roofing',
  description: 'Water coming in during rain',
  status: 'OPEN' as const,
  bidCount: 1,
  createdAt: '2024-01-15T00:00:00.000Z',
  street: null,
  barangay: 'Fort Bonifacio',
  cityMunicipality: 'Taguig',
  province: 'Metro Manila',
  region: 'NCR',
}

const mockBid = {
  id: 'bid-1',
  jobPostId: 'post-1',
  status: 'PENDING' as const,
  message: 'I can fix that',
  createdAt: '2024-01-16T00:00:00.000Z',
  serviceProvider: {
    id: 'sp-1',
    fullName: 'Bob Builder',
    email: 'bob@example.com',
    phone: '+63 912 345 6789',
    serviceProviderProfile: {
      businessName: "Bob's Roofing",
      tradeCategories: ['Roofing'],
      verified: true,
      isCompany: false,
      bio: null,
      serviceCities: [],
    },
  },
}

vi.mock('@/generated/graphql', () => ({
  useJobPostQuery: vi.fn(),
  useBidsQuery: vi.fn(),
  useAcceptBidMutation: vi.fn(),
  useRejectBidMutation: vi.fn(),
  useCloseJobPostMutation: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ appUser: null, session: null, loading: false, signOut: vi.fn(), setAppUser: vi.fn() }),
}))

// Radix dialog needs this
vi.mock('@radix-ui/react-dialog', async (importActual) => {
  const actual = await importActual<typeof import('@radix-ui/react-dialog')>()
  return actual
})

import {
  useJobPostQuery,
  useBidsQuery,
  useAcceptBidMutation,
  useRejectBidMutation,
  useCloseJobPostMutation,
} from '@/generated/graphql'

function renderPage(jobId = 'post-1') {
  return render(
    <MemoryRouter initialEntries={[`/homeowner/jobs/${jobId}`]}>
      <Routes>
        <Route path="/homeowner/jobs/:id" element={<JobDetailPage />} />
        <Route path="/homeowner" element={<div>Homeowner dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useJobPostQuery).mockReturnValue([{ data: { jobPost: mockPost }, fetching: false, stale: false, error: undefined }] as any)
  vi.mocked(useBidsQuery).mockReturnValue([{ data: { bids: [] }, fetching: false, stale: false, error: undefined }, mockRefetchBids] as any)
  vi.mocked(useAcceptBidMutation).mockReturnValue([undefined, mockAcceptBid] as any)
  vi.mocked(useRejectBidMutation).mockReturnValue([undefined, mockRejectBid] as any)
  vi.mocked(useCloseJobPostMutation).mockReturnValue([undefined, mockClosePost] as any)
})

describe('JobDetailPage (homeowner)', () => {
  it('renders loading state', () => {
    vi.mocked(useJobPostQuery).mockReturnValue([{ data: undefined, fetching: true, stale: false, error: undefined }] as any)
    renderPage()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders not found state when post is null', () => {
    vi.mocked(useJobPostQuery).mockReturnValue([{ data: { jobPost: null }, fetching: false, stale: false, error: undefined }] as any)
    renderPage()
    expect(screen.getByText('Job post not found.')).toBeInTheDocument()
  })

  it('renders job title, category, description and status', () => {
    renderPage()
    expect(screen.getByText('Fix leaking roof')).toBeInTheDocument()
    expect(screen.getByText('Roofing')).toBeInTheDocument()
    expect(screen.getByText('Water coming in during rain')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders empty bids state', () => {
    renderPage()
    expect(screen.getByText('No bids yet. Check back soon.')).toBeInTheDocument()
  })

  it('renders bid with service provider name', () => {
    vi.mocked(useBidsQuery).mockReturnValue([{ data: { bids: [mockBid] }, fetching: false, stale: false, error: undefined }, mockRefetchBids] as any)
    renderPage()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
  })

  it('calls acceptBid when Accept is clicked', async () => {
    mockAcceptBid.mockResolvedValue({ data: {}, error: null })
    vi.mocked(useBidsQuery).mockReturnValue([{ data: { bids: [mockBid] }, fetching: false, stale: false, error: undefined }, mockRefetchBids] as any)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /accept/i }))

    await waitFor(() => {
      expect(mockAcceptBid).toHaveBeenCalledWith({ bidId: 'bid-1' })
    })
  })

  it('calls rejectBid when Reject is clicked', async () => {
    mockRejectBid.mockResolvedValue({ data: {}, error: null })
    vi.mocked(useBidsQuery).mockReturnValue([{ data: { bids: [mockBid] }, fetching: false, stale: false, error: undefined }, mockRefetchBids] as any)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /reject/i }))

    await waitFor(() => {
      expect(mockRejectBid).toHaveBeenCalledWith({ bidId: 'bid-1' })
    })
  })

  it('calls closePost when Close post is clicked', async () => {
    mockClosePost.mockResolvedValue({ data: {}, error: null })
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /close post/i }))

    await waitFor(() => {
      expect(mockClosePost).toHaveBeenCalledWith({ id: 'post-1' })
    })
  })
})
