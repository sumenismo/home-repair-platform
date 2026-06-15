import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  useJobPostQuery,
  useBidsQuery,
  useAcceptBidMutation,
  useRejectBidMutation,
  useCloseJobPostMutation,
  type BidsQuery,
} from '@/generated/graphql'
import { formatAddress } from '@/lib/format'

type Bid = BidsQuery['bids'][number]

export function useHomeownerJobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)

  const [{ data: postData, fetching: postFetching }] = useJobPostQuery({
    variables: { id: id! },
  })
  const [{ data: bidsData, fetching: bidsFetching }, refetchBids] = useBidsQuery({
    variables: { jobPostId: id! },
  })
  const [, acceptBid] = useAcceptBidMutation()
  const [, rejectBid] = useRejectBidMutation()
  const [, closePost] = useCloseJobPostMutation()

  const post = postData?.jobPost
  const bids = bidsData?.bids ?? []
  const canManageBids = post?.status === 'OPEN' || post?.status === 'IN_REVIEW'
  const address = post ? formatAddress(post) : ''

  const handleAccept = async (bidId: string) => {
    await acceptBid({ bidId })
    refetchBids()
  }

  const handleReject = async (bidId: string) => {
    await rejectBid({ bidId })
    refetchBids()
  }

  const handleClose = async () => {
    if (!post) return
    await closePost({ id: post.id })
    void navigate('/homeowner', { replace: true })
  }

  return {
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
  }
}
