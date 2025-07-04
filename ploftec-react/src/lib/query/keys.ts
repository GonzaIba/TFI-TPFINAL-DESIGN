// lib/query/keys.ts
export const publicationsKeys = {
  all: ['publications'] as const,
  list: (page: number, pageSize: number) =>
    [...publicationsKeys.all, 'paginated', { page, pageSize }] as const,
  topWeek: (page: number, pageSize: number) => 
    [...publicationsKeys.all, 'top-week', { page, pageSize }] as const,
  saved: (page: number, pageSize: number) => 
    [...publicationsKeys.all, 'saved', { page, pageSize }] as const,
  created: (page: number, pageSize: number) =>
     [...publicationsKeys.all, 'created', { page, pageSize }] as const,
};

export const usersKeys = {
  all: ['forum-users'] as const,
  topWeek: () => [...usersKeys.all, 'top-week'] as const,
};
