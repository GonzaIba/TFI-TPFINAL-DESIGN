// lib/query/hooks/forum/useSavedPublications.ts
import { useQuery } from '@tanstack/react-query';
import { publicationsService } from '@/lib/services/forum/publicationsService';
import { publicationsKeys } from '../../keys';

export function useSavedPublications(enabled: boolean) {
  return useQuery({
    queryKey: publicationsKeys.saved(),
    queryFn: publicationsService.getSavedPublications,
    select: res => res.data ?? [],
    enabled,               // Solo corre cuando enabled=true
    staleTime: 1000 * 60,  // 1 min de refresh
  });
}