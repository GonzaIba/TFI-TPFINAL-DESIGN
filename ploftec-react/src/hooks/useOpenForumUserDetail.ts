'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type NavigateOptions = {
  replace?: boolean;
};

export function useOpenForumUserDetail() {
  const router = useRouter();

  return useCallback((email?: string | null, options?: NavigateOptions) => {
    if (!email) return;
    const query = `?userEmail=${encodeURIComponent(email)}`;

    if (options?.replace) {
      router.replace(`/forum/users${query}`);
    } else {
      router.push(`/forum/users${query}`);
    }
  }, [router]);
}

