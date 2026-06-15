import { Link } from 'react-router'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { BID_STATUS_CLASS, BID_STATUS_LABEL, CATEGORIES } from '@/lib/job-status'
import { useServiceProviderDashboard } from './hooks/useServiceProviderDashboard'

export default function ServiceProviderDashboard() {
  const {
    appUser,
    category,
    setCategory,
    openJobs,
    myBids,
    bidMap,
    jobsFetching,
    myBidsFetching,
  } = useServiceProviderDashboard()

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
