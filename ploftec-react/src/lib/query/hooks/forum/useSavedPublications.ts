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
    queryFn: async () => {
      const res = await publicationsService.getSavedPublications(page, pageSize)
      return res.data!
    },
    enabled, 
    staleTime: 60_000 
  });
}