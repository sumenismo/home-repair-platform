import { Link } from 'react-router'
import { getAllRegions } from '@aivangogh/ph-address'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/job-status'
import { usePostJobPage } from './hooks/usePostJobPage'

const ALL_REGIONS = getAllRegions()

export default function PostJobPage() {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    watchedRegion,
    watchedProvince,
    watchedCityMunicipality,
    watchedBarangay,
    provinces,
    cities,
    barangays,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
  } = usePostJobPage()

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
                  value={watchedRegion}
                  {...register('region')}
                  onChange={(e) => handleRegionChange(e.target.value)}
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
                  value={watchedProvince}
                  {...register('province')}
                  disabled={provinces.length === 0}
                  onChange={(e) => handleProvinceChange(e.target.value)}
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
                  value={watchedCityMunicipality}
                  {...register('cityMunicipality')}
                  disabled={cities.length === 0}
                  onChange={(e) => handleCityChange(e.target.value)}
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
                  value={watchedBarangay}
                  {...register('barangay')}
                  disabled={barangays.length === 0}
                  onChange={(e) => handleBarangayChange(e.target.value)}
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
