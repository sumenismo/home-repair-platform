import { useParams, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useJobPostQuery,
  useMyBidsQuery,
  usePlaceBidMutation,
  type JobPostStatus,
} from '@/generated/graphql'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<JobPostStatus, string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In review',
  ACCEPTED: 'Accepted',
  CLOSED: 'Closed',
}

const STATUS_CLASS: Record<JobPostStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-600',
}

const BID_STATUS_CLASS = {
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

function formatAddress(post: {
  street?: string | null
  barangay?: string | null
  cityMunicipality?: string | null
  province?: string | null
  region?: string | null
}) {
  return [post.street, post.barangay, post.cityMunicipality, post.province, post.region]
    .filter(Boolean)
    .join(', ')
}

const bidSchema = z.object({
  message: z.string().max(500, 'Message must be 500 characters or fewer').optional(),
})

type BidFormValues = z.infer<typeof bidSchema>

export default function ServiceProviderJobDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [{ data: postData, fetching: postFetching }] = useJobPostQuery({
    variables: { id: id! },
  })
  const [{ data: myBidsData, fetching: myBidsFetching }, refetchMyBids] = useMyBidsQuery()
  const [, placeBid] = usePlaceBidMutation()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BidFormValues>({ resolver: zodResolver(bidSchema) })

  const post = postData?.jobPost
  const existingBid = myBidsData?.myBids.find((b) => b.jobPostId === id)

  const onSubmit = async (values: BidFormValues) => {
    const result = await placeBid({
      jobPostId: id!,
      message: values.message || undefined,
    })

    if (result.error) {
      setError('root', { message: result.error.graphQLErrors[0]?.message ?? result.error.message })
      return
    }

    reset()
    refetchMyBids()
  }

  if (postFetching || myBidsFetching) {
    return <p className="text-muted-foreground text-sm">Loading…</p>
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Job post not found.</p>
        <Link to="/service-provider" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to jobs
        </Link>
      </div>
    )
  }

  const address = formatAddress(post)
  const isOpen = post.status === 'OPEN'
  const isFull = post.bidCount >= 5

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
          <p className="text-muted-foreground text-sm">This job is no longer accepting bids.</p>
        </div>
      ) : isFull ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            All bid slots are full. Check back if a slot opens up.
          </p>
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

              {errors.root && (
                <p className="text-destructive text-sm">{errors.root.message}</p>
              )}

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
