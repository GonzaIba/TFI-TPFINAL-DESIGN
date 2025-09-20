// src/lib/query/hooks/useLabels.ts
import { useQuery } from '@tanstack/react-query';
import { labelsService } from '@/lib/services/forum/labelsService';
import { labelsKeys } from '../../keys';
import { LabelResponse } from '@/lib/types/forum';
import { LabelFiltersEnum } from '@/lib/types/enum';
import { PaginatedList } from '@/lib/types/apiResponse';

export function useLabels(
  page: number,
  pageSize: number,
  search: string = '',
  filter: LabelFiltersEnum
) {
  const key = labelsKeys.list(page, pageSize, filter, search ?? '');

  const fetcher = () => labelsService.getLabelsByFilter(filter, page, pageSize);

  return useQuery<PaginatedList<LabelResponse>>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetcher();
      return res.data!;
    },
  });
}
