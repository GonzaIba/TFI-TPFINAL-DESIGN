'use client';

import { create } from 'zustand';
import zustymiddleware from 'zustymiddleware';
import type { RequestHelpResponse } from '@/lib/types/forum';

type LiveHelpState = {
  selected: RequestHelpResponse | null;
  setSelected: (item: RequestHelpResponse | null) => void;
  clear: () => void;
};

const useLiveHelpStore = create<LiveHelpState>()(
  zustymiddleware((set: any) => ({
    selected: null,
    setSelected: (item: RequestHelpResponse | null) => set({ selected: item }),
    clear: () => set({ selected: null }),
  }))
);

// acceso opcional en dev
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.liveHelpStore = useLiveHelpStore;
}

export default useLiveHelpStore;

