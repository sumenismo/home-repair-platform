import { Link } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useMyJobPostsQuery } from '@/generated/graphql'
import { buttonVariants } from '@home-repair/ui'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { STATUS_LABEL, STATUS_CLASS } from '@/lib/job-status'

export default function HomeownerDashboard() {
  const { appUser } = useAuth()
  const [{ data, fetching }] = useMyJobPostsQuery()

  const myJobs = data?.myJobPosts ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {appUser?.fullName ?? 'Homeowner'}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your job listings below.</p>
        </div>
        <Link to="/homeowner/jobs/new" className={buttonVariants()}>
          Post a job
        </Link>
      </div>

      {fetching ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : myJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            You haven't posted any jobs yet. Post your first job to start receiving bids.
          </p>
          <Link to="/homeowner/jobs/new" className={cn(buttonVariants(), 'mt-4')}>
            Post a job
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {myJobs.map((job) => (
            <li key={job.id}>
              <Link
                to={`/homeowner/jobs/${job.id}`}
                className="block rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{job.title}</p>
                    <p className="text-muted-foreground text-sm">{job.category}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      STATUS_CLASS[job.status],
                    )}
                  >
                    {STATUS_LABEL[job.status]}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {job.bidCount} {job.bidCount === 1 ? 'bid' : 'bids'}
                  </span>
                  {(job.cityMunicipality || job.barangay || job.province) && (
                    <span>
                      {[job.barangay, job.cityMunicipality, job.province].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span>{formatDate(job.createdAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
