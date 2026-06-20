import { Link } from 'react-router'
import { Button, buttonVariants, Card, CardContent, CardHeader, CardTitle, cn, SectionHeading, Muted } from '@home-repair/ui'
import { formatDate } from '@/lib/format'
import { STATUS_LABEL, STATUS_CLASS, BID_STATUS_CLASS } from '@/lib/job-status'
import ServiceProviderProfileModal from './ServiceProviderProfileModal'
import { useHomeownerJobDetail } from './hooks/useHomeownerJobDetail'

export default function JobDetailPage() {
  const {
    post,
    bids,
    postFetching,
    bidsFetching,
    canManageBids,
    address,
    selectedBid,
    setSelectedBid,
    handleAccept,
    handleReject,
    handleClose,
  } = useHomeownerJobDetail()

  if (postFetching) {
    return <Muted>Loading…</Muted>
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <Muted>Job post not found.</Muted>
        <Link to="/homeowner" className={buttonVariants({ variant: 'outline' })}>
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/homeowner"
        className="text-sm text-muted-foreground hover:text-foreground inline-block"
      >
        ← Back to dashboard
      </Link>

      {/* Job post details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">{post.category}</p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                STATUS_CLASS[post.status],
              )}
            >
              {STATUS_LABEL[post.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{post.description}</p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {address && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Address</span>
                <p className="mt-0.5">{address}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Posted</span>
              <p className="mt-0.5">{formatDate(post.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bids received</span>
              <p className="mt-0.5">{post.bidCount}</p>
            </div>
          </div>

          {post.status !== 'CLOSED' && (
            <div className="border-t pt-4">
              <Button variant="destructive" size="sm" onClick={handleClose}>
                Close post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bids */}
      <div>
        <SectionHeading className="mb-3">
          Bids {bids.length > 0 && `(${bids.length})`}
        </SectionHeading>

        {bidsFetching ? (
          <Muted>Loading bids…</Muted>
        ) : bids.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Muted>No bids yet. Check back soon.</Muted>
          </div>
        ) : (
          <ul className="space-y-3">
            {bids.map((bid) => {
              const sp = bid.serviceProvider
              const profile = sp.serviceProviderProfile
              return (
                <li
                  key={bid.id}
                  className={cn(
                    'rounded-xl border bg-card p-5 shadow-sm',
                    bid.status === 'REJECTED' && 'opacity-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        className="font-medium text-left hover:underline cursor-pointer"
                        onClick={() => setSelectedBid(bid)}
                      >
                        {sp.fullName ?? sp.email}
                      </button>
                      {profile?.businessName && (
                        <Muted>{profile.businessName}</Muted>
                      )}
                      {profile?.tradeCategories && profile.tradeCategories.length > 0 && (
                        <p className="text-muted-foreground text-xs">
                          {profile.tradeCategories.join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {profile?.verified && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Verified
                        </span>
                      )}
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium',
                          BID_STATUS_CLASS[bid.status],
                        )}
                      >
                        {bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {bid.message && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground border-t pt-3">
                      {bid.message}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground space-x-3">
                      {sp.phone && <span>{sp.phone}</span>}
                      <span>{sp.email}</span>
                      <span>{formatDate(bid.createdAt)}</span>
                    </div>

                    {canManageBids && bid.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAccept(bid.id)}>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(bid.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ServiceProviderProfileModal
        bid={selectedBid}
        open={selectedBid !== null}
        onClose={() => setSelectedBid(null)}
      />
    </div>
  )
}
