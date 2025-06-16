'use client';

import React, { useEffect } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { IconButton, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useSnackbarStore from '@/store/slices/snackBarStore/snackbarStore';

/* ——— Toast listener ——— */
function ToastListener() {
  const { toast, clearToast } = useSnackbarStore();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (toast) {
      enqueueSnackbar(toast.message, {
        variant: toast.variant ?? 'default',
        action: (key) => (
          <IconButton onClick={() => closeSnackbar(key)}>
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        ),
      });
      clearToast();
    }
  }, [toast, enqueueSnackbar, clearToast]);

  return null;
}

/* ——— Modal renderer ——— */
function ModalRenderer() {
  const { modal, clearModal } = useSnackbarStore();
  if (!modal) return null;

  return (
    <Dialog open onClose={clearModal}>
      <DialogTitle>
        {modal.title}
        <IconButton onClick={clearModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {modal.image && (
          <img src={modal.image} alt="modal-img" style={{ width: '100%', marginBottom: 16 }} />
        )}
        <Typography>{modal.message}</Typography>
      </DialogContent>
    </Dialog>
  );
}

/* ——— Provider ——— */
export function SnackBarProvider({ children }: React.PropsWithChildren) {
  return (
    <SnackbarProvider
      maxSnack={4}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <ToastListener />
      {children}
      <ModalRenderer />
    </SnackbarProvider>
  );
}
