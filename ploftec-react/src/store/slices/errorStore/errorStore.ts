'use client'

import React from 'react';
import { create } from "zustand";
import zustymiddleware from "zustymiddleware";

interface ModalData {
  title: string;
  message: string;
  image?: string | null;
}

interface ErrorStore {
  toastMessage: string | null;
  modalData: ModalData | null;
  showToast: (msg: string) => void;
  showModal: (data: ModalData) => void;
  clearToast: (key?: number) => void; // opcional: para cerrar individualmente
  clearModal: () => void;
}

const useErrorStore = create<ErrorStore>(zustymiddleware((set : any) => ({
  toastMessage: null,
  modalData: null,
  showToast: (msg: string) => set({ toastMessage: msg }),
  showModal: (data: any) => set({ modalData: data }),
  clearToast: () => set({ toastMessage: null }),
  clearModal: () => set({ modalData: null }),
})));

// Solo en cliente
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.store = useErrorStore;
}
export default useErrorStore;