import { Outlet, Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthLayout() {
  const { session, appUser, loading } = useAuth()

  if (loading) return null

  if (session && appUser) {
    return <Navigate to={appUser.role === 'HOMEOWNER' ? '/homeowner' : '/service-provider'} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
