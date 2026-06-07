import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  getAllRegions,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from '@aivangogh/ph-address'
import { useMeQuery, useUpdateProfileMutation } from '@/generated/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  street: z.string().optional(),
  region: z.string().optional(),
  province: z.string().optional(),
  cityMunicipality: z.string().optional(),
  barangay: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const ALL_REGIONS = getAllRegions()

export default function HomeownerProfilePage() {
  const [{ data, fetching }, reexecuteMeQuery] = useMeQuery()
  const [, updateProfile] = useUpdateProfileMutation()

  const [selectedRegionCode, setSelectedRegionCode] = useState('')
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedCityCode, setSelectedCityCode] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  const provinces = selectedRegionCode ? getProvincesByRegion(selectedRegionCode) : []
  const cities = selectedProvinceCode ? getMunicipalitiesByProvince(selectedProvinceCode) : []
  const barangays = selectedCityCode ? getBarangaysByMunicipality(selectedCityCode) : []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const watchedRegion = watch('region') ?? ''
  const watchedProvince = watch('province') ?? ''
  const watchedCityMunicipality = watch('cityMunicipality') ?? ''
  const watchedBarangay = watch('barangay') ?? ''

  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !data?.me) return
    prefilled.current = true

    const me = data.me
    if (me.fullName) setValue('fullName', me.fullName)
    if (me.phone) setValue('phone', me.phone)

    const hp = me.homeownerProfile
    if (!hp) return

    if (hp.address) setValue('street', hp.address)

    const regionObj = ALL_REGIONS.find((r) => r.name === hp.region)
    const regionCode = regionObj?.psgcCode ?? ''
    setSelectedRegionCode(regionCode)
    if (hp.region) setValue('region', hp.region)

    const provincesInRegion = regionCode ? getProvincesByRegion(regionCode) : []
    const provinceObj = provincesInRegion.find((p) => p.name === hp.province)
    const provinceCode = provinceObj?.psgcCode ?? ''
    setSelectedProvinceCode(provinceCode)
    if (hp.province) setValue('province', hp.province)

    const citiesInProvince = provinceCode ? getMunicipalitiesByProvince(provinceCode) : []
    const cityObj = citiesInProvince.find((c) => c.name === hp.cityMunicipality)
    const cityCode = cityObj?.psgcCode ?? ''
    setSelectedCityCode(cityCode)
    if (hp.cityMunicipality) setValue('cityMunicipality', hp.cityMunicipality)

    if (hp.barangay) setValue('barangay', hp.barangay)
  }, [data, setValue])

  const onSubmit = async (values: FormValues) => {
    setSavedMessage('')
    const result = await updateProfile({
      input: {
        fullName: values.fullName,
        phone: values.phone || undefined,
        address: values.street || undefined,
        barangay: values.barangay || undefined,
        cityMunicipality: values.cityMunicipality || undefined,
        province: values.province || undefined,
        region: values.region || undefined,
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
          Your contact details and default address.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Your default address will pre-fill the job post form.
          </CardDescription>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="region">Region</Label>
                <Select
                  id="region"
                  value={watchedRegion}
                  {...register('region')}
                  onChange={(e) => {
                    const selected = ALL_REGIONS.find((r) => r.name === e.target.value)
                    setSelectedRegionCode(selected?.psgcCode ?? '')
                    setSelectedProvinceCode('')
                    setSelectedCityCode('')
                    setValue('region', e.target.value)
                    setValue('province', '')
                    setValue('cityMunicipality', '')
                    setValue('barangay', '')
                  }}
                >
                  <option value="">Select region…</option>
                  {ALL_REGIONS.map((r) => (
                    <option key={r.psgcCode} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="province">Province</Label>
                <Select
                  id="province"
                  value={watchedProvince}
                  {...register('province')}
                  disabled={provinces.length === 0}
                  onChange={(e) => {
                    const selected = provinces.find((p) => p.name === e.target.value)
                    setSelectedProvinceCode(selected?.psgcCode ?? '')
                    setSelectedCityCode('')
                    setValue('province', e.target.value)
                    setValue('cityMunicipality', '')
                    setValue('barangay', '')
                  }}
                >
                  <option value="">Select province…</option>
                  {provinces.map((p) => (
                    <option key={p.psgcCode} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cityMunicipality">City / Municipality</Label>
                <Select
                  id="cityMunicipality"
                  value={watchedCityMunicipality}
                  {...register('cityMunicipality')}
                  disabled={cities.length === 0}
                  onChange={(e) => {
                    const selected = cities.find((c) => c.name === e.target.value)
                    setSelectedCityCode(selected?.psgcCode ?? '')
                    setValue('cityMunicipality', e.target.value)
                    setValue('barangay', '')
                  }}
                >
                  <option value="">Select city/municipality…</option>
                  {cities.map((c) => (
                    <option key={c.psgcCode} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="barangay">Barangay</Label>
                <Select
                  id="barangay"
                  value={watchedBarangay}
                  {...register('barangay')}
                  disabled={barangays.length === 0}
                  onChange={(e) => setValue('barangay', e.target.value)}
                >
                  <option value="">Select barangay…</option>
                  {barangays.map((b) => (
                    <option key={b.psgcCode} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="street">Street / Subdivision</Label>
              <Input
                id="street"
                placeholder="e.g. 123 Rizal St., Sunshine Subdivision"
                {...register('street')}
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
