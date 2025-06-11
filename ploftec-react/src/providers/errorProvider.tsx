'use client'

import useErrorStore from '@/store/slices/errorStore/errorStore';
import React, { useEffect } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ToastListener() {
  const { toastMessage, clearToast } = useErrorStore();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (toastMessage) {
      enqueueSnackbar(toastMessage, {
        variant: 'error',
        action: key => (
          <IconButton onClick={() => closeSnackbar(key)}>
            <CloseIcon style={{ color: 'white' }} />
          </IconButton>
        ),
      });
      clearToast();
    }
  }, [toastMessage, enqueueSnackbar, clearToast]);

  return null;
}

export function ErrorProvider({ children }: any) {
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

function ModalRenderer() {
  const { modalData, clearModal } = useErrorStore();
  if (!modalData) return null;
  return (
    <Dialog open={!!modalData} onClose={clearModal}>
      <DialogTitle>
        {modalData?.title}
        <IconButton
          aria-label="close"
          onClick={clearModal}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {modalData?.image && <img src={modalData.image} alt="error" style={{ width: "100%", marginBottom: 16 }} />}
        <Typography>{modalData?.message}</Typography>
      </DialogContent>
    </Dialog>
  );
}
