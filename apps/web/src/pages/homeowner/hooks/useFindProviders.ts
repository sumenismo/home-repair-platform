import { useEffect, useRef, useState } from 'react'
import { type SearchProvidersQuery, useSearchProvidersQuery } from '@/generated/graphql'

const PAGE_SIZE = 10

type Provider = SearchProvidersQuery['serviceProviders'][number]

export function useFindProviders() {
  const [keyword, setKeywordRaw] = useState('')
  const [cities, setCitiesRaw] = useState<string[]>([])
  const [category, setCategoryRaw] = useState('')
  const [offset, setOffset] = useState(0)
  const [accumulated, setAccumulated] = useState<Provider[]>([])

  const appendRef = useRef(false)

  const [{ data, fetching }] = useSearchProvidersQuery({
    variables: {
      filter: {
        keyword: keyword.trim() || null,
        cities: cities.length ? cities : null,
        category: category || null,
      },
      limit: PAGE_SIZE,
      offset,
    },
  })

  useEffect(() => {
    if (!data?.serviceProviders) return
    if (appendRef.current) {
      setAccumulated((prev) => [...prev, ...data.serviceProviders])
    } else {
      setAccumulated(data.serviceProviders)
    }
    appendRef.current = false
  }, [data])

  const resetAndSet = <T,>(setter: (v: T) => void) => (v: T) => {
    appendRef.current = false
    setter(v)
    setOffset(0)
  }

  const setKeyword = resetAndSet(setKeywordRaw)
  const setCities = resetAndSet(setCitiesRaw)
  const setCategory = resetAndSet(setCategoryRaw)

  const hasMore = (data?.serviceProviders?.length ?? 0) === PAGE_SIZE

  const loadMore = () => {
    appendRef.current = true
    setOffset((prev) => prev + PAGE_SIZE)
  }

  return {
    keyword,
    setKeyword,
    cities,
    setCities,
    category,
    setCategory,
    providers: accumulated,
    fetching,
    hasMore,
    loadMore,
  }
}
