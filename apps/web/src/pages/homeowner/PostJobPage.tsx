import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import {
  getAllRegions,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from '@aivangogh/ph-address'
import { useCreateJobPostMutation } from '@/generated/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(CATEGORIES, { required_error: 'Please select a category' }),
  street: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const ALL_REGIONS = getAllRegions()

export default function PostJobPage() {
  const navigate = useNavigate()
  const [, createJobPost] = useCreateJobPostMutation()

  const [selectedRegionCode, setSelectedRegionCode] = useState('')
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedCityCode, setSelectedCityCode] = useState('')

  const provinces = selectedRegionCode ? getProvincesByRegion(selectedRegionCode) : []
  const cities = selectedProvinceCode ? getMunicipalitiesByProvince(selectedProvinceCode) : []
  const barangays = selectedCityCode ? getBarangaysByMunicipality(selectedCityCode) : []

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    const result = await createJobPost({
      input: {
        title: values.title,
        description: values.description,
        category: values.category,
        street: values.street || undefined,
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

    void navigate('/homeowner', { replace: true })
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/homeowner"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Post a job</CardTitle>
          <CardDescription>Describe the work you need done to start receiving bids</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job title</Label>
                <Input id="title" placeholder="e.g. Fix leaking roof" {...register('title')} />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select id="category" {...register('category')}>
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
                {errors.category && (
                  <p className="text-destructive text-xs">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the problem, any relevant details, and what you expect to be done…"
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-destructive text-xs">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="region">Region (optional)</Label>
                <Select
                  id="region"
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
                <Label htmlFor="province">Province (optional)</Label>
                <Select
                  id="province"
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
                <Label htmlFor="cityMunicipality">City / Municipality (optional)</Label>
                <Select
                  id="cityMunicipality"
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
                <Label htmlFor="barangay">Barangay (optional)</Label>
                <Select
                  id="barangay"
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
              <Label htmlFor="street">Street / Subdivision (optional)</Label>
              <Input
                id="street"
                placeholder="e.g. 123 Rizal St., Sunshine Subdivision"
                {...register('street')}
              />
            </div>

            {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post job'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
