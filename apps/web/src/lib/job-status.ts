import type { JobPostStatus, BidStatus } from '@/generated/graphql'

export const STATUS_LABEL: Record<JobPostStatus, string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In review',
  ACCEPTED: 'Accepted',
  CLOSED: 'Closed',
}

export const STATUS_CLASS: Record<JobPostStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-600',
}

export const BID_STATUS_CLASS: Record<BidStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-gray-100 text-gray-500',
}

export const BID_STATUS_LABEL: Record<BidStatus, string> = {
  PENDING: 'Bid pending',
  ACCEPTED: 'Bid accepted',
  REJECTED: 'Bid rejected',
}

export const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Roofing',
  'Carpentry',
  'Painting',
  'Tiling',
  'Landscaping',
  'General',
] as const

export type Category = (typeof CATEGORIES)[number]
