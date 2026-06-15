import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import JobDetailPage from '../JobDetailPage'

const { mockPlaceBid, mockRefetchMyBids } = vi.hoisted(() => ({
  mockPlaceBid: vi.fn(),
  mockRefetchMyBids: vi.fn(),
}))

const mockPost = {
  id: 'post-1',
  title: 'Fix leaking roof',
  category: 'Roofing',
  description: 'Urgent repair needed',
  status: 'OPEN' as const,
  bidCount: 2,
  createdAt: '2024-01-15T00:00:00.000Z',
  street: null,
  barangay: null,
  cityMunicipality: 'Taguig',
  province: 'Metro Manila',
  region: 'NCR',
}

vi.mock('@/generated/graphql', () => ({
  useJobPostQuery: vi.fn(),
  useMyBidsQuery: vi.fn(),
  usePlaceBidMutation: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ appUser: null, session: null, loading: false, signOut: vi.fn(), setAppUser: vi.fn() }),
}))

import { useJobPostQuery, useMyBidsQuery, usePlaceBidMutation } from '@/generated/graphql'

function renderPage(jobId = 'post-1') {
  return render(
    <MemoryRouter initialEntries={[`/service-provider/jobs/${jobId}`]}>
      <Routes>
        <Route path="/service-provider/jobs/:id" element={<JobDetailPage />} />
        <Route path="/service-provider" element={<div>SP dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useJobPostQuery).mockReturnValue([{ data: { jobPost: mockPost }, fetching: false, stale: false, error: undefined }] as any)
  vi.mocked(useMyBidsQuery).mockReturnValue([{ data: { myBids: [] }, fetching: false, stale: false, error: undefined }, mockRefetchMyBids] as any)
  vi.mocked(usePlaceBidMutation).mockReturnValue([undefined, mockPlaceBid] as any)
  mockPlaceBid.mockResolvedValue({ data: {}, error: null })
})

describe('ServiceProviderJobDetailPage', () => {
  it('renders loading state', () => {
    vi.mocked(useJobPostQuery).mockReturnValue([{ data: undefined, fetching: true, stale: false, error: undefined }] as any)
    renderPage()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders job title, status, bid count', () => {
    renderPage()
    expect(screen.getByText('Fix leaking roof')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('renders place-bid form when no existing bid and job is OPEN and not full', () => {
    renderPage()
    expect(screen.getByText('Place a bid')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument()
  })

  it('shows existing bid card when myBids contains a matching bid', () => {
    const existingBid = {
      id: 'bid-1',
      jobPostId: 'post-1',
      status: 'PENDING' as const,
      message: 'I can help',
      createdAt: '2024-01-16T00:00:00.000Z',
    }
    vi.mocked(useMyBidsQuery).mockReturnValue([{ data: { myBids: [existingBid] }, fetching: false, stale: false, error: undefined }, mockRefetchMyBids] as any)
    renderPage()
    expect(screen.getByText('Your bid')).toBeInTheDocument()
    expect(screen.getByText('I can help')).toBeInTheDocument()
  })

  it('shows "no longer accepting bids" when job is not OPEN', () => {
    vi.mocked(useJobPostQuery).mockReturnValue([{
      data: { jobPost: { ...mockPost, status: 'CLOSED' } },
      fetching: false,
      stale: false,
      error: undefined,
    }] as any)
    renderPage()
    expect(screen.getByText('This job is no longer accepting bids.')).toBeInTheDocument()
  })

  it('shows "All bid slots are full" when bidCount >= 5', () => {
    vi.mocked(useJobPostQuery).mockReturnValue([{
      data: { jobPost: { ...mockPost, bidCount: 5 } },
      fetching: false,
      stale: false,
      error: undefined,
    }] as any)
    renderPage()
    expect(screen.getByText('All bid slots are full. Check back if a slot opens up.')).toBeInTheDocument()
  })

  it('calls placeBid on form submit', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /place bid/i }))

    await waitFor(() => {
      expect(mockPlaceBid).toHaveBeenCalledWith({
        jobPostId: 'post-1',
        message: undefined,
      })
    })
  })
})
