// lib/query/hooks/forum/useSavedPublications.ts
import { useQuery } from '@tanstack/react-query';
import { publicationsService } from '@/lib/services/forum/publicationsService';
import { publicationsKeys } from '../../keys';

export function useSavedPublications(
  enabled: boolean,
  page: number,
  pageSize: number
) {  return useQuery({
    queryKey: publicationsKeys.saved(page, pageSize),
    queryFn: () => publicationsService.getSavedPublications(page, pageSize),
    enabled,
    select: res => res.data!, // Solo corre cuando enabled=true
    staleTime: 1000 * 60, // 1 min de refresh
  });
}