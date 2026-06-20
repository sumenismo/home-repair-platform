import { Link } from 'react-router'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from '@home-repair/ui'
import { useSignupPage } from './hooks/useSignupPage'

export default function SignupPage() {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, selectedRole, setValue } =
    useSignupPage()

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
