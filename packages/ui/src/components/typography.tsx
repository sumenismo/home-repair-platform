import * as React from 'react'
import { cn } from '../lib/utils'

const PageHeading = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h1'>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn('text-2xl font-semibold', className)} {...props} />
  ),
)
PageHeading.displayName = 'PageHeading'

const PageLead = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />
  ),
)
PageLead.displayName = 'PageLead'

const SectionHeading = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h2'>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-base font-semibold', className)} {...props} />
  ),
)
SectionHeading.displayName = 'SectionHeading'

const Overline = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs font-medium uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  ),
)
Overline.displayName = 'Overline'

const Muted = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
)
Muted.displayName = 'Muted'

export { PageHeading, PageLead, SectionHeading, Overline, Muted }
