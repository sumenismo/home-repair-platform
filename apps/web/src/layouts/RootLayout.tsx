import { Outlet, Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

export default function RootLayout() {
  return <Outlet />
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
