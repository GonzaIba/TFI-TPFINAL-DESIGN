'use client';

import { Colors } from '@/theme/colors';
import { TooltipProps } from '@mui/material';
import {
  Button as ButtonMui,
  CircularProgress,
  Stack,
  Typography,
  Tooltip,
  Zoom,
  Fade,
} from '@mui/material';

interface ButtonPloftecProps {
  text?: string;
  onClick: () => Promise<void> | void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  circular?: boolean;
  width?: string;
  height?: string
  borderRadius?: string
  transparent?: boolean;
  backgroundColor?: string;
  tooltipOptions?: TooltipOptions;
}

interface TooltipOptions {
  title: string;
  placement?: TooltipProps['placement'];
  width?: number | string;
  transition?: 'zoom' | 'fade' | 'none';
  followCursor?: boolean;
  arrow?: boolean;
}

export default function ButtonPloftec({
  text = '',
  onClick,
  icon,
  loading = false,
  disabled = false,
  circular = false,
  width = '170px',
  height = '45px',
  borderRadius = '5px',
  transparent = false,
  backgroundColor = Colors.primary,
  tooltipOptions,
}: ButtonPloftecProps) {

  const {
    title,
    placement = 'bottom',
    width: tooltipWidth = 500,
    transition = 'none',
    followCursor = false,
    arrow = false,
  } = tooltipOptions || {};

  const TransitionComponent =
    transition === 'zoom' ? Zoom : transition === 'fade' ? Fade : undefined;

  const buttonContent = (
  <ButtonMui
    onClick={onClick}
    disabled={disabled || loading}
    sx={{
      width: circular ? '45px' : width,
      height: height,
      minWidth: 0,
      borderRadius: circular ? '50%' : borderRadius,
      backgroundColor: transparent ? 'transparent' : backgroundColor,
      color: transparent ? backgroundColor : '#fff',
      boxShadow: transparent ? 'none' : '0 5px 10px rgba(255, 255, 255, 0.1)',
      textTransform: 'none',
      fontFamily: 'inherit',
      transition: 'background-color 0.3s ease, transform 0.3s ease, color 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: transparent ? 'rgba(255, 255, 255, 0.1)' : `${backgroundColor}cc`,
      },
      '&.Mui-disabled': {
        color: transparent ? backgroundColor : '#fff',
        backgroundColor: transparent ? 'transparent' : `${backgroundColor}99`,
        cursor: 'not-allowed',
        pointerEvents: 'auto',
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
          <Stack alignItems="center" justifyContent="center" sx={{ display: 'flex' }}>
            {icon}
          </Stack>
        )}
        {!circular && text && (
          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'inherit' }}>
            {text}
          </Typography>
        )}
      </Stack>
    )}
  </ButtonMui>
);

return (tooltipOptions && !loading) ? (
  <Tooltip
    title={<div style={{ maxWidth: tooltipWidth }}>{title}</div>}
    placement={placement}
    followCursor={followCursor}
    arrow={arrow}
    enterDelay={500}
    leaveDelay={200}
    slots={{
      transition: TransitionComponent,
    }}
  >
    {buttonContent}
  </Tooltip>
) : (
  buttonContent
);

}
