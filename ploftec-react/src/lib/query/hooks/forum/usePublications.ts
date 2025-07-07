// src/lib/query/hooks/usePublications.ts
import { useQuery } from '@tanstack/react-query'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { publicationsKeys } from '../../keys'
import { PublicationResponse } from '@/lib/types/forum'
import { PaginatedList } from '@/lib/types/apiResponse'

export function usePublications(
  page: number,
  pageSize: number,
  search?: string
) {
  const key = search
    ? ['publications','search', { search, page, pageSize }] as const
    : publicationsKeys.list(page, pageSize)

  const fetcher = () =>
    search
      ? publicationsService.getPublicationsWithFilter(search, page, pageSize)
      : publicationsService.getPublications(page, pageSize)

  return useQuery<PaginatedList<PublicationResponse>>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetcher()
      return res.data!
    }
  })
}
