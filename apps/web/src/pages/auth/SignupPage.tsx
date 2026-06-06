import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRegisterUserMutation } from '@/generated/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['HOMEOWNER', 'SERVICE_PROVIDER'], {
    required_error: 'Please select a role',
  }),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
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
    void navigate(user.role === 'HOMEOWNER' ? '/homeowner' : '/service-provider', {
      replace: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Join as a homeowner or service provider</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" placeholder="Alex Smith" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-destructive text-xs">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>I am a…</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['HOMEOWNER', 'SERVICE_PROVIDER'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue('role', role, { shouldValidate: true })}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-sm font-medium transition-colors',
                    selectedRole === role
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {role === 'HOMEOWNER' ? 'Homeowner' : 'Service Provider'}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
          </div>
          {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
