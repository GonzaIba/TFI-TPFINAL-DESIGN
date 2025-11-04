'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/slices/authStore/authStore';

const isAdminRole = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().includes('admin');
};

export default function AdministrationPage() {
  const router = useRouter();
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const roleName = useAuthStore((state) => state.role ?? state.user?.roleName ?? null);

  const isAdmin = useMemo(() => isAdminRole(roleName), [roleName]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isAdmin) {
      router.replace('/forum/publications');
    }
  }, [isAdmin, isAuthLoaded, router]);

  if (!isAuthLoaded || !isAdmin) {
    return null;
  }

  return <div />;
}
