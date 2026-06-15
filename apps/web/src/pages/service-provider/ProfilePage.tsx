import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMeQuery, useUpdateProfileMutation } from '@/generated/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CityMultiSelect } from '@/components/ui/city-multi-select'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Roofing',
  'Carpentry',
  'Painting',
  'Tiling',
  'Landscaping',
  'General',
] as const

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  isCompany: z.boolean(),
  tradeCategories: z.array(z.string()),
  serviceCities: z.array(z.string()),
  bio: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function ServiceProviderProfilePage() {
  const [{ data, fetching }, reexecuteMeQuery] = useMeQuery()
  const [, updateProfile] = useUpdateProfileMutation()
  const [savedMessage, setSavedMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isCompany: false, tradeCategories: [], serviceCities: [] },
  })

  const isCompany = watch('isCompany')
  const tradeCategories = watch('tradeCategories')

  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !data?.me) return
    prefilled.current = true

    const me = data.me
    if (me.fullName) setValue('fullName', me.fullName)
    if (me.phone) setValue('phone', me.phone)

    const sp = me.serviceProviderProfile
    if (!sp) return
    if (sp.businessName) setValue('businessName', sp.businessName)
    setValue('isCompany', sp.isCompany)
    setValue('tradeCategories', sp.tradeCategories ?? [])
    setValue('serviceCities', sp.serviceCities ?? [])
    if (sp.bio) setValue('bio', sp.bio)
  }, [data, setValue])

  const toggleCategory = (cat: string) => {
    const current = tradeCategories ?? []
    if (current.includes(cat)) {
      setValue('tradeCategories', current.filter((c) => c !== cat))
    } else {
      setValue('tradeCategories', [...current, cat])
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSavedMessage('')
    const result = await updateProfile({
      input: {
        fullName: values.fullName,
        phone: values.phone || undefined,
        businessName: values.businessName || undefined,
        isCompany: values.isCompany,
        tradeCategories: values.tradeCategories,
        serviceCities: values.serviceCities,
        bio: values.bio || undefined,
      },
    })

    if (result.error) {
      setError('root', { message: result.error.message })
      return
    }

    reexecuteMeQuery({ requestPolicy: 'network-only' })
    setSavedMessage('Profile saved.')
  }

  if (fetching) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your business details and service categories.
        </p>
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
