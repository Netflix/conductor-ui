import React from "react";
import { Input } from ".";
import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CloseIcon from "@mui/icons-material/Close";
import { InputAdornment, CircularProgress } from "@mui/material";

interface DropdownProps<T>
  extends Omit<
    AutocompleteProps<
      T,
      boolean | undefined,
      boolean | undefined,
      boolean | undefined
    >,
    "renderInput"
  > {
  label?: string;
  className?: string;
  style?: any;
  error?: any;
  helperText?: string;
  name?: any;
  value?: any;
  placeholder?: any;
  loading?: boolean;
  disabled?: boolean;
}

export default function Dropdown<T>({
  label,
  className,
  style,
  error,
  helperText,
  name,
  value,
  placeholder,
  loading,
  disabled,
  ...props
}: DropdownProps<T>) {
  return (
    <FormControl style={style} className={className}>
      {label && <InputLabel error={!!error}>{label}</InputLabel>}
      <Autocomplete
        {...props}
        disabled={loading || disabled}
        clearIcon={<CloseIcon />}
        renderInput={({ InputProps, ...params }) => (
          <Input
            {...params}
            InputProps={{
              ...InputProps,
              ...(loading && {
                startAdornment: (
                  <InputAdornment position="end">
                    <CircularProgress size={20} color="inherit" thickness={6} />
                  </InputAdornment>
                ),
              }),
            }}
            placeholder={loading ? "Loading Options" : placeholder}
            name={name}
            error={!!error}
            helperText={helperText}
          />
        )}
        value={value === undefined ? null : value} // convert undefined to null
      />
    </FormControl>
  );
}
