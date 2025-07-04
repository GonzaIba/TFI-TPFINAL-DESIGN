// src/lib/query/hooks/useCreatedPublications.ts
import { useQuery } from '@tanstack/react-query'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { publicationsKeys } from '../../keys'

export function useCreatedPublications(
  enabled: boolean,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: publicationsKeys.created(page, pageSize),
    queryFn: () => publicationsService.getCreatedPublications(page, pageSize),
    enabled,
    select: res => res.data!,
  })
}