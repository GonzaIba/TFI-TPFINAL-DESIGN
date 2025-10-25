// src/lib/query/hooks/useRequestsHelpInfinite.ts
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { requestHelpService } from "@/lib/services/forum/requestHelpService";
import type { RequestHelpConfirmedResponse, RequestHelpResponse } from "@/lib/types/forum";
import type { CursorPage } from "@/lib/types/apiResponse";

type PageParam = { after?: string; anchor: string; search?: string };

export type RetryModeGetter = () => "auto" | "manual";

export function useRequestsHelpInfinite(
  limit = 8,
  search?: string,
  refresh = 0,
  enabled = true,
  getRetryMode?: RetryModeGetter,
) {
  // normalizo busqueda (evita refetch por espacios)
  const normSearch = search?.trim() || undefined;

  // ancla fijo por sesion de busqueda (se regenera cuando cambia `normSearch`)
  const anchor = useMemo(() => new Date().toISOString(), [normSearch, refresh]);

  return useInfiniteQuery<
    CursorPage<RequestHelpResponse>,
    Error,
    RequestHelpResponse[],
    any[],
    PageParam
  >({
    queryKey: ["livehelp", "requests-cursor", { limit, anchor, search: normSearch, refresh }],
    initialPageParam: { after: undefined, anchor, search: normSearch },
    queryFn: async ({ pageParam }) => {
      const { after, anchor, search } = pageParam!;
      const res = await requestHelpService.getRequestsHelp(limit, after, anchor, search);
      if (!res.data) throw new Error("No data returned from getRequestsHelp");
      return res.data;
    },
    enabled,
    getNextPageParam: (lastPage, _pages, lastParam) =>
      lastPage?.hasNext && lastPage.nextCursor
        ? { after: lastPage.nextCursor, anchor: lastParam!.anchor, search: lastParam!.search }
        : undefined,
    select: (data) => data.pages.flatMap((p) => p.items ?? []),
    staleTime: 30_000,
    retry: (failureCount) => {
      const mode = getRetryMode?.() ?? "auto";
      const maxRetries = mode === "manual" ? 0 : 2;
      return failureCount <= maxRetries;
    },
  });
}

export function useMyRequestsHelp(
  enabled = true,
  refresh?: number,
  getRetryMode?: RetryModeGetter,
) {
  const refreshKey = refresh ?? 0;
  return useQuery<RequestHelpResponse[], Error>({
    queryKey: ["livehelp", "my-requests", { refresh: refreshKey }],
    queryFn: async () => {
      const res = await requestHelpService.getMyHelpRequests();
      if (!res.data) throw new Error("No data returned from getMyHelpRequests");
      return res.data;
    },
    enabled,
    staleTime: 30_000,
    retry: (failureCount) => {
      const mode = getRetryMode?.() ?? "auto";
      const maxRetries = mode === "manual" ? 0 : 2;
      return failureCount <= maxRetries;
    },
  });
}

export function useConfirmedHelpRequests(enabled = true, refresh = 0) {
  return useQuery<RequestHelpConfirmedResponse[], Error>({
    queryKey: ["livehelp", "confirmed-requests", { refresh }],
    queryFn: async () => {
      const res = await requestHelpService.getConfirmedHelpRequests();
      if (!res.data) return [];
      return res.data;
    },
    enabled,
    staleTime: 30_000,
  });
}
