import { Link } from 'react-router'
import {
  Button,
  Textarea,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Muted,
} from '@home-repair/ui'
import { formatDate } from '@/lib/format'
import { STATUS_LABEL, STATUS_CLASS, BID_STATUS_CLASS } from '@/lib/job-status'
import { useServiceProviderJobDetail } from './hooks/useServiceProviderJobDetail'

export default function ServiceProviderJobDetailPage() {
  const {
    post,
    postFetching,
    myBidsFetching,
    existingBid,
    isOpen,
    isFull,
    address,
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  } = useServiceProviderJobDetail()

  if (postFetching || myBidsFetching) {
    return <Muted>Loading…</Muted>
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <Muted>Job post not found.</Muted>
        <Link
          to="/service-provider"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to jobs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/service-provider"
        className="text-sm text-muted-foreground hover:text-foreground inline-block"
      >
        ← Back to jobs
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
              <span className="text-muted-foreground">Pending bids</span>
              <p className="mt-0.5">{post.bidCount} / 5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid section */}
      {existingBid ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your bid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  BID_STATUS_CLASS[existingBid.status],
                )}
              >
                {existingBid.status.charAt(0) + existingBid.status.slice(1).toLowerCase()}
              </span>
              <span className="text-muted-foreground text-xs">
                Submitted {formatDate(existingBid.createdAt)}
              </span>
            </div>
            {existingBid.message && (
              <p className="text-sm leading-relaxed text-muted-foreground border-t pt-3">
                {existingBid.message}
              </p>
            )}
          </CardContent>
        </Card>
      ) : !isOpen ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <Muted>This job is no longer accepting bids.</Muted>
        </div>
      ) : isFull ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <Muted>All bid slots are full. Check back if a slot opens up.</Muted>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Place a bid</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Introduce yourself, describe your approach, or ask a question…"
                  rows={4}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-destructive text-xs">{errors.message.message}</p>
                )}
              </div>

              {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Placing bid…' : 'Place bid'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
