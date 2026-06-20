import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { gqlClient } from '@/lib/gql-client'
import { MeDocument, type MeQuery, type MeQueryVariables } from '@/generated/graphql'

type AppUser = {
  id: string
  email: string
  role: 'HOMEOWNER' | 'SERVICE_PROVIDER'
  fullName: string | null
}

type AuthContextValue = {
  session: Session | null
  appUser: AppUser | null
  loading: boolean
  setAppUser: (user: AppUser) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) {
        const result = await gqlClient.query<MeQuery, MeQueryVariables>(MeDocument, {}).toPromise()
        const user = result.data?.me
        if (user) {
          setAppUser({
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName ?? null,
          })
        }
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
      if (!newSession) setAppUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setAppUser(null)
  }

  return (
    <AuthContext.Provider value={{ session, appUser, loading, setAppUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
