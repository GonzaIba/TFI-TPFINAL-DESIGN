import { ThemeProvider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { darkTheme } from '@/theme/mui';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FilterResponse } from '@/lib/types/forum';

interface Props {
  item: FilterResponse;
  dateValue: Date | null;
  updateFilterValue: (key: number, value: string) => void;
}

export function DateTime({ item, dateValue, updateFilterValue }: Props) {
  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label={item.descriptionFilter}
          value={dateValue}
          onChange={(newVal: Date | null) =>
            updateFilterValue(item.codeFilter, newVal ? newVal.toISOString() : '')
          }
          slotProps={{
            textField: { fullWidth: true, size: 'small', variant: 'outlined' },

            // No es muy atractivo el scroll default...
            desktopPaper: {
              sx: (theme) => ({
                '& .MuiMultiSectionDigitalClockSection-root': {
                  // Firefox
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${alpha(theme.palette.text.primary, 0.30)} transparent`,
                  // WebKit
                  '&::-webkit-scrollbar': {
                    width: 10,
                    height: 10,
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.20),
                    borderRadius: 6,
                    border: `2px solid ${theme.palette.background.paper}`,
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.35),
                  },
                },
              }),
            },

            // Lo mismo para el diálogo mobile
            mobilePaper: {
              sx: (theme) => ({
                '& .MuiMultiSectionDigitalClockSection-root': {
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${alpha(theme.palette.text.primary, 0.30)} transparent`,
                  '&::-webkit-scrollbar': {
                    width: 10,
                    height: 10,
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.20),
                    borderRadius: 6,
                    border: `2px solid ${theme.palette.background.paper}`,
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.35),
                  },
                },
              }),
            },
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
