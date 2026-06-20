import { Controller } from 'react-hook-form'
import { Button, Input, Label, Textarea, Checkbox, Card, CardContent, CardDescription, CardHeader, CardTitle, CityMultiSelect, cn, PageHeading, PageLead, Muted } from '@home-repair/ui'
import { CATEGORIES } from '@/lib/job-status'
import { useServiceProviderProfile } from './hooks/useServiceProviderProfile'

export default function ServiceProviderProfilePage() {
  const {
    register,
    handleSubmit,
    control,
    onSubmit,
    errors,
    isSubmitting,
    savedMessage,
    fetching,
    isCompany,
    tradeCategories,
    setValue,
    toggleCategory,
  } = useServiceProviderProfile()

  if (fetching) return <Muted>Loading…</Muted>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <PageHeading>My profile</PageHeading>
        <PageLead>Your business details and service categories.</PageLead>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Visible to homeowners when you place a bid.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...register('fullName')} />
                {errors.fullName && (
                  <p className="text-destructive text-xs">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" placeholder="+63 9XX XXX XXXX" {...register('phone')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business name (optional)</Label>
              <Input
                id="businessName"
                placeholder="e.g. Santos Electrical Services"
                {...register('businessName')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Account type</Label>
              <div className="grid grid-cols-2 gap-2">
                {([false, true] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setValue('isCompany', val, { shouldValidate: true })}
                    className={cn(
                      'rounded-md border px-3 py-2.5 text-sm font-medium transition-colors',
                      isCompany === val
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    {val ? 'Company' : 'Individual'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service areas</Label>
              <p className="text-muted-foreground text-xs">
                Jobs outside these cities won't appear in your feed. Leave empty to see all.
              </p>
              <Controller
                control={control}
                name="serviceCities"
                render={({ field }) => (
                  <CityMultiSelect value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Trade categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Controller
                      control={control}
                      name="tradeCategories"
                      render={() => (
                        <Checkbox
                          checked={(tradeCategories ?? []).includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                      )}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Describe your experience, certifications, or specialties…"
                rows={3}
                {...register('bio')}
              />
            </div>

            {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
            {savedMessage && <p className="text-sm text-green-600">{savedMessage}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
