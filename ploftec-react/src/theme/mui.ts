// theme.ts
import { createTheme, alpha } from '@mui/material/styles';
import { Colors } from './colors';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: Colors.primary }, // tu Colors.primary
    background: {
      default: '#0f0f10',
      paper: '#121212',
    },
  },
  components: {
    // Input del TextField del picker
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          borderRadius: 10,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.common.white, 0.15),
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.common.white, 0.25),
          },
        }),
        input: ({ theme }) => ({
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: alpha(theme.palette.text.primary, 0.7),
          '&.Mui-focused': { color: theme.palette.primary.main },
        }),
      },
    },

    // Contenedores del popup (desktop y mobile)
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
        }),
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
            border: "3px solid #2b2b2b",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "#2b2b2b",
          },
        },
      },
    },  

    // Partes específicas de X Date Pickers
    // MuiPickersLayout: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       '& .MuiDivider-root': {
    //         borderColor: theme.palette.divider,
    //       },
    //       '& .MuiPickersLayout-actionBar button': {
    //         color: theme.palette.primary.main,
    //       },
    //     }),
    //   },
    // },
    // MuiPickersCalendarHeader: {
    //   styleOverrides: {
    //     label: ({ theme }) => ({
    //       color: alpha(theme.palette.text.primary, 0.9),
    //     }),
    //   },
    // },
    // MuiPickersDay: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       color: theme.palette.text.primary,
    //       '&.Mui-selected': {
    //         backgroundColor: theme.palette.primary.main,
    //         color: theme.palette.primary.contrastText,
    //         '&:hover': {
    //           backgroundColor: theme.palette.primary.main,
    //         },
    //       },
    //     }),
    //   },
    // },
    // MuiMultiSectionDigitalClockSection: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       borderColor: theme.palette.divider,
    //     }),
    //     item: ({ theme }) => ({
    //       color: theme.palette.text.primary,
    //       '&.Mui-selected': {
    //         backgroundColor: alpha(theme.palette.common.white, 0.06),
    //         color: theme.palette.primary.main,
    //       },
    //     }),
    //   },
    // },
  },
});
