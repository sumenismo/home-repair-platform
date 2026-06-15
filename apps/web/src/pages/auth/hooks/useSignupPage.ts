import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRegisterUserMutation } from '@/generated/graphql'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['HOMEOWNER', 'SERVICE_PROVIDER'], {
    required_error: 'Please select a role',
  }),
})

type FormValues = z.infer<typeof schema>

export function useSignupPage() {
  const navigate = useNavigate()
  const { setAppUser } = useAuth()
  const [, registerUser] = useRegisterUserMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const selectedRole = watch('role')

  const onSubmit = async ({ fullName, email, password, role }: FormValues) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('root', { message: error.message })
      return
    }
    if (!data.session) {
      setError('root', {
        message: 'Check your email to confirm your account, then sign in.',
      })
      return
    }

    const result = await registerUser({ input: { role, fullName } })
    if (result.error) {
      setError('root', { message: result.error.message })
      return
    }

    const user = result.data?.registerUser
    if (!user) {
      setError('root', { message: 'Registration failed' })
      return
    }

    setAppUser({ ...user, fullName: user.fullName ?? null })
    void navigate(user.role === 'HOMEOWNER' ? '/homeowner' : '/service-provider', { replace: true })
  }

  return { register, handleSubmit, onSubmit, errors, isSubmitting, selectedRole, setValue }
}
