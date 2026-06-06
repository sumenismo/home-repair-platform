import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

export function renderWithProviders(ui: ReactNode, { initialPath = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  )
}
