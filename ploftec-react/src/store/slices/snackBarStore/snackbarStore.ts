'use client';

import { create } from 'zustand';
import zustymiddleware from 'zustymiddleware';

/* ——— Tipos ——— */
export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'error';

interface ToastData {
  message: string;
  variant?: ToastVariant;
}

interface ModalData {
  title: string;
  message: string;
  image?: string | null;
  variant?: ToastVariant;               // opcional, por si querés colorear el modal según severidad
}

interface SnackBarStore {
  toast: ToastData | null;
  modal: ModalData | null;
  /* API pública */
  showToast: (d: ToastData) => void;
  showModal: (d: ModalData) => void;
  clearToast: () => void;
  clearModal: () => void;
}

const useSnackBarStore = create<SnackBarStore>()(
  zustymiddleware((set: any) => ({
    toast: null,
    modal: null,
    showToast: (toast : ToastData) => set({ toast }),
    showModal: (modal : ModalData) => set({ modal }),
    clearToast: () => set({ toast: null }),
    clearModal: () => set({ modal: null }),
  }))
);

/* Acceso global opcional en dev */
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.store = useSnackBarStore;
}
export default useSnackBarStore;
