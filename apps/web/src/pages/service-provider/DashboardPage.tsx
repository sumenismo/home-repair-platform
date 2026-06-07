import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import {
  useJobPostsQuery,
  useMyBidsQuery,
  type JobPostStatus,
  type BidStatus,
} from '@/generated/graphql'
import { Select } from '@/components/ui/select'
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

const STATUS_CLASS: Record<JobPostStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-600',
}

const BID_STATUS_LABEL: Record<BidStatus, string> = {
  PENDING: 'Bid pending',
  ACCEPTED: 'Bid accepted',
  REJECTED: 'Bid rejected',
}

const BID_STATUS_CLASS: Record<BidStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ServiceProviderDashboard() {
  const { appUser } = useAuth()
  const [category, setCategory] = useState('')

  const [{ data: jobsData, fetching: jobsFetching }] = useJobPostsQuery({
    variables: { filter: { status: 'OPEN', ...(category ? { category } : {}) } },
  })
  const [{ data: myBidsData, fetching: myBidsFetching }] = useMyBidsQuery()

  const openJobs = jobsData?.jobPosts ?? []
  const myBids = myBidsData?.myBids ?? []
  const bidMap = new Map(myBids.map((b) => [b.jobPostId, b]))

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {appUser?.fullName ?? 'Service Provider'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse open jobs and place your bids.
        </p>
      </div>

      {/* Browse open jobs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Open jobs</h2>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-44"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {jobsFetching ? (
          <p className="text-muted-foreground text-sm">Loading jobs…</p>
        ) : openJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              No open jobs right now. Check back soon.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {openJobs.map((job) => {
              const existingBid = bidMap.get(job.id)
              const isFull = job.bidCount >= 5
              const location = [job.cityMunicipality, job.province].filter(Boolean).join(', ')

              return (
                <li key={job.id}>
                  <Link
                    to={`/service-provider/jobs/${job.id}`}
                    className="block rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium">{job.title}</p>
                        <p className="text-muted-foreground text-sm">{job.category}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {existingBid && (
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-medium',
                              BID_STATUS_CLASS[existingBid.status],
                            )}
                          >
                            {BID_STATUS_LABEL[existingBid.status]}
                          </span>
                        )}
                        {!existingBid && isFull && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                            Full
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {job.bidCount} / 5 bids
                      </span>
                      {location && <span>{location}</span>}
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* My bids */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">My bids</h2>

        {myBidsFetching ? (
          <p className="text-muted-foreground text-sm">Loading bids…</p>
        ) : myBids.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">
              You haven't placed any bids yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {myBids.map((bid) => {
              const location = [bid.jobPost.cityMunicipality, bid.jobPost.province]
                .filter(Boolean)
                .join(', ')
              return (
                <li key={bid.id}>
                  <Link
                    to={`/service-provider/jobs/${bid.jobPost.id}`}
                    className={cn(
                      'flex items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-colors hover:bg-accent',
                      bid.status === 'REJECTED' && 'opacity-60',
                    )}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">{bid.jobPost.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {bid.jobPost.category}
                        {location ? ` · ${location}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium',
                          BID_STATUS_CLASS[bid.status],
                        )}
                      >
                        {bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(bid.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
