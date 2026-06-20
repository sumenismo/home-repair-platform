import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { gqlClient } from '@/lib/gql-client'
import { MeDocument, type MeQuery, type MeQueryVariables } from '@/generated/graphql'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export function useLoginPage() {
  const navigate = useNavigate()
  const { setAppUser } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, password }: FormValues) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('root', { message: error.message })
        return
      }
      if (!data.session) {
        setError('root', { message: 'Please confirm your email before signing in.' })
        return
      }

      const result = await gqlClient.query<MeQuery, MeQueryVariables>(MeDocument, {}).toPromise()
      const user = result.data?.me

      if (!user) {
        setError('root', { message: 'Account not found — please sign up first.' })
        await supabase.auth.signOut()
        return
      }

      setAppUser({ ...user, fullName: user.fullName ?? null })
      void navigate(user.role === 'HOMEOWNER' ? '/homeowner' : '/service-provider', {
        replace: true,
      })
    } catch {
      setError('root', { message: 'Could not reach the server. Make sure the API is running.' })
    }
  }

  return { register, handleSubmit, onSubmit, errors, isSubmitting }
}
