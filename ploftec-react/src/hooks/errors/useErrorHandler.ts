// src/lib/hooks/useErrorHandler.ts
import { useCallback } from "react";
import { ExceptionBase } from "@/lib/types/exception";
import { getMappedError } from "@/lib/utils/getMappedError";
import useErrorStore from "@/store/slices/snackBarStore/snackbarStore"; // lo creamos abajo

export function useErrorHandler() {
  const { showToast, showModal } = useErrorStore();

  return useCallback((errors: ExceptionBase[]) => {
    const mapped = getMappedError(errors);
    if (!mapped) return;

    const { exception, config } = mapped;
    console.log("Error manejado:", exception);
    switch (config.type) {
      case "toast":
        showToast({ message:  exception.message || "Error inesperado", variant: 'error'});
        break;
      case "modal":
        showModal({
          title: exception.title || "Error",
          message: exception.message || "Algo salió mal",
          image: exception.image || null,
        });
        break;
    }
  }, [showToast, showModal]);
}
