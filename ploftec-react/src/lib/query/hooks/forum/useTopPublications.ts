// lib/query/hooks/useTopPublications.ts
import { useQuery } from '@tanstack/react-query'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { publicationsKeys } from '../../keys'

export function useTopPublications() {
  return useQuery({
    queryKey: publicationsKeys.topWeek(),
    queryFn: publicationsService.getTopPublicationsLastWeek,
    select: res => res.data ?? [],
    staleTime: 1000 * 60 * 60, // son 'del último 7d'; podés alargarlo a 1 h
  })
}