import { useAuth } from '@/contexts/AuthContext'

export default function ServiceProviderDashboard() {
  const { appUser } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome, {appUser?.fullName ?? 'Service Provider'}
      </h1>
      <p className="text-muted-foreground mt-1">Browse open jobs and place your bids.</p>
    </div>
  )
}
