import { useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useJobPostQuery, useMyBidsQuery, usePlaceBidMutation } from '@/generated/graphql'
import { formatAddress } from '@/lib/format'

const bidSchema = z.object({
  message: z.string().max(500, 'Message must be 500 characters or fewer').optional(),
})

type BidFormValues = z.infer<typeof bidSchema>

export function useServiceProviderJobDetail() {
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
  const isOpen = post?.status === 'OPEN'
  const isFull = (post?.bidCount ?? 0) >= 5
  const address = post ? formatAddress(post) : ''

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

  return {
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
  }
}
