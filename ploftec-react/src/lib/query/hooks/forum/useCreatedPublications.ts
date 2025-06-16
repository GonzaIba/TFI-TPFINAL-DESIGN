// lib/query/hooks/useCreatedPublications.ts
import { useQuery } from '@tanstack/react-query';
import { publicationsKeys } from '../../keys';
import { publicationsService } from '@/lib/services/forum/publicationsService';

export function useCreatedPublications(enabled: boolean) {
  return useQuery({
    queryKey: publicationsKeys.created(),
    queryFn: publicationsService.getCreatedPublications,
    select: res => res.data ?? [],
    enabled,
  });
}