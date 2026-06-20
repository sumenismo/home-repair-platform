import { getAllRegions } from '@aivangogh/ph-address'
import { Button, Input, Label, Select, Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeading, PageLead, Muted } from '@home-repair/ui'
import { useHomeownerProfile } from './hooks/useHomeownerProfile'

const ALL_REGIONS = getAllRegions()

export default function HomeownerProfilePage() {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    savedMessage,
    fetching,
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
  } = useHomeownerProfile()

  if (fetching) return <Muted>Loading…</Muted>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <PageHeading>My profile</PageHeading>
        <PageLead>Your contact details and default address.</PageLead>
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
                <Label htmlFor="province">Province</Label>
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
                <Label htmlFor="cityMunicipality">City / Municipality</Label>
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
                <Label htmlFor="barangay">Barangay</Label>
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
