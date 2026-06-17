import { useMemo, useRef, useState } from 'react'
import { getAllRegions, getProvincesByRegion, getMunicipalitiesByProvince } from '@aivangogh/ph-address'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── static data ─────────────────────────────────────────────────────────────

type CityEntry = { name: string; label: string }

const INDEPENDENT_BY_REGION: Record<string, string[]> = {
  '1300000000': [
    'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila',
    'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig',
    'Quezon City', 'San Juan', 'Taguig', 'Valenzuela',
  ],
  '1400000000': ['Baguio City'],
  '0300000000': ['Angeles City', 'Olongapo City'],
  '0400000000': ['Lucena City'],
  '1700000000': ['Puerto Princesa City'],
  '0600000000': ['Bacolod City', 'Iloilo City'],
  '0700000000': ['Cebu City', 'Lapu-Lapu City', 'Mandaue City'],
  '0800000000': ['Tacloban City'],
  '0900000000': ['Isabela City', 'Zamboanga City'],
  '1000000000': ['Cagayan de Oro', 'Iligan City'],
  '1100000000': ['Davao City'],
  '1200000000': ['General Santos City'],
  '1600000000': ['Butuan City'],
}

const ALL_CITIES: CityEntry[] = getAllRegions()
  .flatMap((region) => {
    const provinces = getProvincesByRegion(region.psgcCode)
    const fromPackage: CityEntry[] = provinces.flatMap((p) =>
      getMunicipalitiesByProvince(p.psgcCode).map((m) => ({
        name: m.name,
        label: `${m.name}, ${p.name}`,
      })),
    )
    const independent: CityEntry[] = (INDEPENDENT_BY_REGION[region.psgcCode] ?? []).map((c) => ({
      name: c,
      label: c,
    }))
    return [...fromPackage, ...independent]
  })
  .sort((a, b) => a.label.localeCompare(b.label))

const CITY_LABEL = new Map<string, string>(ALL_CITIES.map((c) => [c.name, c.label]))

// ─── component ───────────────────────────────────────────────────────────────

interface CityMultiSelectProps {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}

export function CityMultiSelect({
  value,
  onChange,
  placeholder = 'Search city or municipality…',
}: CityMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return []
    return ALL_CITIES.filter(
      (c) => !value.includes(c.name) && c.label.toLowerCase().includes(q),
    ).slice(0, 50)
  }, [search, value])

  const add = (city: CityEntry) => {
    onChange([...value, city.name])
    setSearch('')
    inputRef.current?.focus()
  }

  const remove = (name: string) => onChange(value.filter((v) => v !== name))

  return (
    <div className="relative">
      <div
        className={cn(
          'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 shadow-sm transition-colors cursor-text',
          'focus-within:ring-1 focus-within:ring-ring',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((name) => (
          <span
            key={name}
            className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {CITY_LABEL.get(name) ?? name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(name) }}
              className="hover:text-primary-foreground/70 rounded-full"
              aria-label={`Remove ${name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={value.length === 0 ? placeholder : ''}
          autoComplete="off"
          className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && search.length > 0 && (
        <ul className={cn(
          'border-input bg-background absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-md border shadow-md',
        )}>
          {filtered.length > 0 ? (
            filtered.map((city) => (
              <li key={city.label}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(city)}
                  className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm"
                >
                  {city.label}
                </button>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground px-3 py-2 text-sm">
              No results for "{search}"
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
