// lib/query/keys.ts
export const publicationsKeys = {
  all: ['publications'] as const,
  list: () => [...publicationsKeys.all, 'list'] as const,
  topWeek: () => [...publicationsKeys.all, 'top-week'] as const,
  saved: () => [...publicationsKeys.all, 'saved'] as const,
  created: () => [...publicationsKeys.all, 'created'] as const,
};

export const usersKeys = {
  all: ['forum-users'] as const,
  topWeek: () => [...usersKeys.all, 'top-week'] as const,
};
