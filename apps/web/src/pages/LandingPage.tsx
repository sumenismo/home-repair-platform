import { Link, Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { buttonVariants } from '@home-repair/ui'

export default function LandingPage() {
  const { session, appUser, loading } = useAuth()

  if (loading) return null

  if (session && appUser) {
    return (
      <Navigate to={appUser.role === 'HOMEOWNER' ? '/homeowner' : '/service-provider'} replace />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Home Repair Platform</h1>
        <p className="text-muted-foreground text-lg">
          Connect homeowners with trusted service providers
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/signup" className={buttonVariants({ size: 'lg' })}>
          Sign up
        </Link>
        <Link to="/login" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          Log in
        </Link>
      </div>
    </div>
  )
}
