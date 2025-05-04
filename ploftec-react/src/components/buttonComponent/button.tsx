'use client';

import { Button as ButtonMui, CircularProgress, Stack, Typography } from '@mui/material';

interface ButtonPloftecProps {
  text?: string;
  onClick: () => Promise<void> | void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  circular?: boolean;
  width?: string;
  transparent?: boolean;
  backgroundColor?: string;
}

export default function ButtonPloftec({
  text = '',
  onClick,
  icon,
  loading = false,
  disabled = false,
  circular = false,
  width = '170px',
  transparent = false,
  backgroundColor = '#644bff', // color por defecto violeta
}: ButtonPloftecProps) {
  return (
    <ButtonMui
      onClick={onClick}
      disabled={disabled || loading}
      sx={{
        width: circular ? '45px' : width,
        height: '45px',
        minWidth: 0,
        borderRadius: circular ? '50%' : '5px',
        backgroundColor: transparent ? 'transparent' : backgroundColor,
        color: transparent ? backgroundColor : '#fff',
        boxShadow: transparent ? 'none' : '0 5px 10px rgba(255, 255, 255, 0.1)',
        textTransform: 'none',
        fontFamily: 'inherit', // <<--- ACA HAGO QUE USE LA FUENTE DE TU HTML
        transition: 'background-color 0.3s ease, transform 0.3s ease, color 0.3s ease',
        '&:hover': {
          backgroundColor: transparent ? 'rgba(255, 255, 255, 0.1)' : `${backgroundColor}cc`, // 80% opacidad si no es transparente
        },
      }}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: 'inherit' }} />
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={icon && text ? 1 : 0}
          sx={{ width: '100%', height: '100%' }}
        >
        {icon && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ display: 'flex' }}
          >
            {icon}
          </Stack>
          )}
          {!circular && text && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              {text}
            </Typography>
          )}
        </Stack>
      )}
    </ButtonMui>
  );
}
