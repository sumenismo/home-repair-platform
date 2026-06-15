import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useJobPostsQuery, useMyBidsQuery } from '@/generated/graphql'

export function useServiceProviderDashboard() {
  const { appUser } = useAuth()
  const [category, setCategory] = useState('')

  const [{ data: jobsData, fetching: jobsFetching }] = useJobPostsQuery({
    variables: { filter: { status: 'OPEN', ...(category ? { category } : {}) } },
  })
  const [{ data: myBidsData, fetching: myBidsFetching }] = useMyBidsQuery()

  const openJobs = jobsData?.jobPosts ?? []
  const myBids = myBidsData?.myBids ?? []
  const bidMap = new Map(myBids.map((b) => [b.jobPostId, b]))

  return { appUser, category, setCategory, openJobs, myBids, bidMap, jobsFetching, myBidsFetching }
}
