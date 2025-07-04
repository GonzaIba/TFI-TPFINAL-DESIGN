// src/lib/query/hooks/usePublications.ts
import { useQuery } from '@tanstack/react-query'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { publicationsKeys } from '../../keys'
import { PublicationResponse } from '@/lib/types/forum'
import { PaginatedList } from '@/lib/types/apiResponse'

export function usePublications(page: number, pageSize: number) {
  return useQuery({
    queryKey: publicationsKeys.list(page, pageSize),
    queryFn: () => publicationsService.getPublications(page, pageSize),
    select: (res) => res.data!,
  })
}
