import { LabelFiltersEnum } from '@/lib/types/enum';

export const publicationsKeys = {
  all: ['publications'] as const,
  list: (page: number, pageSize: number) =>
    [...publicationsKeys.all, 'paginated', { page, pageSize }] as const,
  topWeek: () =>
    [...publicationsKeys.all, 'top-week'] as const,
  saved: (page: number, pageSize: number) => 
    [...publicationsKeys.all, 'saved', { page, pageSize }] as const,
  created: (page: number, pageSize: number) =>
     [...publicationsKeys.all, 'created', { page, pageSize }] as const,
};

export const usersKeys = {
  all: ['forum-users'] as const,
  topWeek: () => [...usersKeys.all, 'top-week'] as const,
};

export const labelsKeys = {
  all: ['labels'] as const,
  list: (
    page: number,
    pageSize: number,
    filter: LabelFiltersEnum,
    search: string
  ) => [...labelsKeys.all, 'list', { page, pageSize, filter, search }] as const,
  search: (search: string, page: number, pageSize: number) =>
    [...labelsKeys.all, 'search', { search, page, pageSize }] as const,
  filter: (filter: LabelFiltersEnum, page: number, pageSize: number) =>
    [...labelsKeys.all, 'filter', { filter, page, pageSize }] as const,
};

export const liveHelpKeys = {
  all: ["livehelp"] as const,
  requests: (pageSize: number) =>
    [...liveHelpKeys.all, "requests", { pageSize }] as const,
};
