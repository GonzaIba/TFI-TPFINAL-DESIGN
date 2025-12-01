// Keep redirect behavior but ensure the view has full height while navigating
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForumRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/forum/publications');
  }, [router]);

  return <div style={{ minHeight: '100vh', width: '100%' }} />;
}
