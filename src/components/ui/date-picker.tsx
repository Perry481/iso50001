import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  className?: string;
  id?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  label,
  className,
  id,
  error,
  disabled,
  required,
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
      <MuiDatePicker
        value={value ? new Date(value) : null}
        onChange={(newValue) => {
          onChange(newValue ? newValue.toISOString().split("T")[0] : "");
        }}
        label={label}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            height: "40px",
            backgroundColor: "white",
            "& fieldset": {
              borderColor: error ? "#ef4444" : "#d1d5db",
            },
            "&:hover fieldset": {
              borderColor: error ? "#ef4444" : "#d1d5db",
            },
            "&.Mui-focused fieldset": {
              borderColor: error ? "#ef4444" : "#2563eb",
              borderWidth: "1px",
            },
            "&.Mui-disabled": {
              backgroundColor: "#f3f4f6",
            },
          },
          "& .MuiInputBase-input": {
            color: disabled ? "#9ca3af" : "#171717",
            fontSize: "14px",
            padding: "10px 14px",
            "&::placeholder": {
              color: "#9ca3af",
              opacity: 1,
            },
          },
          "& .MuiInputLabel-root": {
            color: error ? "#ef4444" : "#6b7280",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: error ? "#ef4444" : "#2563eb",
          },
        }}
        slotProps={{
          textField: {
            id,
            className: cn(
              "w-full rounded-md border border-input bg-background",
              className
            ),
            required,
            error,
          },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                width: "280px",
                border: "1px solid #e5e7eb",
                "& .MuiPickersDay-root": {
                  fontSize: "0.875rem",
                },
                "& .MuiPickersDay-today": {
                  borderColor: "#2563eb",
                },
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: "#2563eb",
                },
                "& .MuiDayCalendar-header": {
                  "& .MuiDayCalendar-weekDayLabel": {
                    fontSize: "0.875rem",
                  },
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
