import { Outlet, Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { ShieldCheckIcon, SmileIcon, ThumbsUpIcon, HeartHomeIcon } from '@home-repair/ui'

export default function AuthLayout() {
  const { session, appUser, loading } = useAuth()

  if (loading) return null

  if (session && appUser) {
    return (
      <Navigate to={appUser.role === 'HOMEOWNER' ? '/homeowner' : '/service-provider'} replace />
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col bg-background px-12 py-10 justify-center gap-12">
        {/* mix-blend-multiply removes the white baked into logo.png on the cream background */}
        {/* <img
          src="/logo.png"
          alt="Aprub!"
          className="h-16 w-auto object-contain self-start mix-blend-multiply"
        /> */}

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-secondary leading-tight">
            Trusted home pros,
            <br />
            checked for your peace of mind.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Aprub! connects you with trusted and verified home service professionals you can count
            on.
          </p>
        </div>

        {/* min-h-0 prevents flex child from overflowing the column */}
        {/* <div className="flex-1 flex items-center justify-center py-4 min-h-0">
          <img
            src="/aprub-homes.png"
            alt="Trusted home professionals"
            className="w-full max-w-lg object-contain"
          />
        </div> */}

        {/* 4-column row matching the design */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              icon: <ShieldCheckIcon className="h-6 w-6" />,
              title: 'Trusted & Verified',
              desc: 'Pros are vetted for quality',
            },
            {
              icon: <SmileIcon className="h-6 w-6" />,
              title: 'Friendly Service',
              desc: 'Warm, approachable and helpful',
            },
            {
              icon: <ThumbsUpIcon className="h-6 w-6" />,
              title: 'Reliable & Local',
              desc: 'Serving your neighborhood with care',
            },
            {
              icon: <HeartHomeIcon className="h-6 w-6" />,
              title: 'Peace of Mind',
              desc: 'Book with confidence every time',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-xs font-bold text-secondary">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center bg-background py-8 lg:py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
