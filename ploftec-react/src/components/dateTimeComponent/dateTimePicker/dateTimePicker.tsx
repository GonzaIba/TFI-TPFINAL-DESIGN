import { ThemeProvider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { darkTheme } from '@/theme/mui';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FilterResponse } from '@/lib/types/forum';

type DateTimeProps =
  | {
      item: FilterResponse;
      dateValue: Date | null;
      updateFilterValue: (key: number, value: string) => void;
      label?: string;
      minDateTime?: Date;
      maxDateTime?: Date;
      disabled?: boolean;
      minutesStep?: number;
    }
  | {
      item?: undefined;
      dateValue: Date | null;
      onChange: (value: Date | null) => void;
      label: string;
      minDateTime?: Date;
      maxDateTime?: Date;
      disabled?: boolean;
      minutesStep?: number;
    };

export function DateTime(props: DateTimeProps) {
  const {
    item,
    dateValue,
    label,
    minDateTime,
    maxDateTime,
    disabled,
    minutesStep = 1,
  } = props;

  const handleChange = (newVal: Date | null) => {
    if (item && "updateFilterValue" in props) {
      props.updateFilterValue(item.codeFilter, newVal ? newVal.toISOString() : "");
    } else if ("onChange" in props) {
      props.onChange(newVal);
    }
  };

  const resolvedLabel = label ?? item?.descriptionFilter ?? "";

  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label={resolvedLabel}
          value={dateValue}
          onChange={handleChange}
          minDateTime={minDateTime}
          maxDateTime={maxDateTime}
          disabled={disabled}
          minutesStep={minutesStep}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              variant: 'outlined',
            },

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
