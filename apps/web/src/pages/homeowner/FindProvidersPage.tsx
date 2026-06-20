import { Input, Select, Label, Button, CityMultiSelect, cn, PageHeading, PageLead, Muted } from '@home-repair/ui'
import { CATEGORIES } from '@/lib/job-status'
import { useFindProviders } from './hooks/useFindProviders'

export default function FindProvidersPage() {
  const {
    keyword,
    setKeyword,
    cities,
    setCities,
    category,
    setCategory,
    providers,
    fetching,
    hasMore,
    loadMore,
  } = useFindProviders()

  return (
    <div className="space-y-6">
      <div>
        <PageHeading>Find providers</PageHeading>
        <PageLead>Search for service providers by name, city, or trade category.</PageLead>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="keyword">Search by name</Label>
          <Input
            id="keyword"
            placeholder="e.g. Santos Electrical…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>City / Municipality</Label>
          <CityMultiSelect
            value={cities}
            onChange={setCities}
            placeholder="Search city…"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results */}
      {fetching ? (
        <Muted>Loading…</Muted>
      ) : providers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Muted>No providers found. Try adjusting your filters.</Muted>
        </div>
      ) : (
        <>
        <ul className="space-y-3" aria-live="polite">
          {providers.map((provider) => {
            const profile = provider.serviceProviderProfile
            const displayName = provider.fullName ?? provider.email
            const cities = profile?.serviceCities ?? []
            const visibleCities = cities.slice(0, 3)
            const extraCities = cities.length - visibleCities.length

            return (
              <li
                key={provider.id}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-medium">{displayName}</p>
                    {profile?.businessName && (
                      <Muted>{profile.businessName}</Muted>
                    )}
                  </div>
                  {profile?.verified && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      Verified
                    </span>
                  )}
                </div>

                {/* Categories */}
                {profile && profile.tradeCategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profile.tradeCategories.map((cat) => (
                      <span
                        key={cat}
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          'bg-secondary text-secondary-foreground',
                        )}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Service cities */}
                {visibleCities.length > 0 && (
                  <p className="text-muted-foreground mt-3 text-xs">
                    Serves:{' '}
                    {visibleCities.join(', ')}
                    {extraCities > 0 && ` +${extraCities} more`}
                  </p>
                )}

                {/* Contact */}
                <div className="text-muted-foreground mt-3 flex items-center gap-3 border-t pt-3 text-xs">
                  {provider.phone && <span>{provider.phone}</span>}
                  <span>{provider.email}</span>
                </div>
              </li>
            )
          })}
        </ul>

        {hasMore && (
          <div className="pt-2 text-center">
            <Button variant="outline" onClick={loadMore} disabled={fetching}>
              {fetching ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
        </>
      )}
    </div>
  )
}
