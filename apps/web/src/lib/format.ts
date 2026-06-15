export type AddressFields = {
  street?: string | null
  barangay?: string | null
  cityMunicipality?: string | null
  province?: string | null
  region?: string | null
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatAddress(post: AddressFields): string {
  return [post.street, post.barangay, post.cityMunicipality, post.province, post.region]
    .filter(Boolean)
    .join(', ')
}
