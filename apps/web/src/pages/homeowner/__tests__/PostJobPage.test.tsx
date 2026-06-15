import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import PostJobPage from '../PostJobPage'

const { mockCreateJobPost } = vi.hoisted(() => ({
  mockCreateJobPost: vi.fn(),
}))

vi.mock('@/generated/graphql', () => ({
  useCreateJobPostMutation: () => [undefined, mockCreateJobPost],
  useMeQuery: () => [{ data: { me: { homeownerProfile: null } }, fetching: false }],
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ appUser: null, session: null, loading: false, signOut: vi.fn(), setAppUser: vi.fn() }),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/homeowner/jobs/new']}>
      <Routes>
        <Route path="/homeowner/jobs/new" element={<PostJobPage />} />
        <Route path="/homeowner" element={<div>Homeowner dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateJobPost.mockResolvedValue({ data: { createJobPost: { id: 'new-post-1' } }, error: null })
})

describe('PostJobPage', () => {
  it('shows validation errors on empty submit', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /post job/i }))

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 5 characters')).toBeInTheDocument()
      expect(screen.getByText('Description must be at least 20 characters')).toBeInTheDocument()
    })
  })

  it('calls createJobPost with correct input on valid submit', async () => {
    renderPage()

    await userEvent.type(screen.getByLabelText(/job title/i), 'Fix leaking roof today')
    await userEvent.type(
      screen.getByLabelText(/description/i),
      'Water coming in during heavy rain, need urgent repair',
    )
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Roofing')
    await userEvent.click(screen.getByRole('button', { name: /post job/i }))

    await waitFor(() => {
      expect(mockCreateJobPost).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            title: 'Fix leaking roof today',
            category: 'Roofing',
          }),
        }),
      )
    })
  })

  it('navigates to /homeowner after successful submission', async () => {
    renderPage()

    await userEvent.type(screen.getByLabelText(/job title/i), 'Fix leaking roof today')
    await userEvent.type(
      screen.getByLabelText(/description/i),
      'Water coming in during heavy rain, need urgent repair',
    )
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Roofing')
    await userEvent.click(screen.getByRole('button', { name: /post job/i }))

    await waitFor(() => {
      expect(screen.getByText('Homeowner dashboard')).toBeInTheDocument()
    })
  })

  it('shows root error on mutation failure', async () => {
    mockCreateJobPost.mockResolvedValue({
      data: null,
      error: { message: 'Something went wrong' },
    })

    renderPage()

    await userEvent.type(screen.getByLabelText(/job title/i), 'Fix leaking roof today')
    await userEvent.type(
      screen.getByLabelText(/description/i),
      'Water coming in during heavy rain, need urgent repair',
    )
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Roofing')
    await userEvent.click(screen.getByRole('button', { name: /post job/i }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})
