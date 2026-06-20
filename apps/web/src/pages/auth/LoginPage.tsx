import { useState } from 'react'
import { Link } from 'react-router'
import {
  Button,
  Input,
  Label,
  ShieldCheckIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from '@home-repair/ui'
import { useLoginPage } from './hooks/useLoginPage'

export default function LoginPage() {
  const { register, handleSubmit, onSubmit, errors, isSubmitting } = useLoginPage()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <a
            href="#"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-foreground font-medium underline underline-offset-4 hover:no-underline"
          >
            Sign up
          </Link>
        </p>
      </form>

      <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4">
        <ShieldCheckIcon className="h-8 w-8 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-secondary">
            Book trusted home pros with confidence.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">We check. We verify. We aprub!</p>
        </div>
      </div>
    </div>
  )
}
