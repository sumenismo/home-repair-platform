import { Outlet, Navigate, NavLink } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@home-repair/ui'

export default function AppLayout() {
  const { session, appUser, loading, signOut } = useAuth()

  if (loading) return null
  if (!session || !appUser) return <Navigate to="/login" replace />

  const navLinks =
    appUser.role === 'HOMEOWNER'
      ? [
          { to: '/homeowner', label: 'Dashboard' },
          { to: '/homeowner/find-providers', label: 'Find Providers' },
          { to: '/homeowner/profile', label: 'Profile' },
        ]
      : [
          { to: '/service-provider', label: 'Browse Jobs' },
          { to: '/service-provider/profile', label: 'Profile' },
        ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-sm">Home Repair</span>
            <nav className="flex gap-4">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `text-sm transition-colors ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {appUser.fullName ?? appUser.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
