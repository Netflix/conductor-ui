import React, { useRef } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export default function (props) {
  const { label, clearable, onBlur, onChange, InputProps, ...rest } = props;
  const inputRef = useRef();

  function handleClear() {
    inputRef.current.value = "";
    if (onBlur) return onBlur("");
    if (onChange) return onChange("");
  }

  function handleBlur(e) {
    if (onBlur) onBlur(e.target.value);
  }

  function handleChange(e) {
    if (onChange) onChange(e.target.value);
  }

  return (
    <TextField
      label={label}
      inputRef={inputRef}
      InputLabelProps={{ shrink: true }}
      InputProps={
        InputProps || {
          endAdornment: clearable && (
            <InputAdornment position="end" style={{ marginRight: -8 }}>
              <IconButton
                size="small"
                onClick={handleClear}
                disabled={props.disabled}
              >
                <ClearIcon fontSize="inherit" />
              </IconButton>
            </InputAdornment>
          ),
        }
      }
      onBlur={handleBlur}
      onChange={handleChange}
      {...rest}
    />
  );
}
