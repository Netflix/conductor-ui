import React from "react";
import {
  FormControl,
  InputLabel,
  ButtonGroup as MuiButtonGroup,
  Button,
  ButtonGroupProps as MuiButtonGroupProps,
} from "@mui/material";

export type ButtonGroupProps = {
  style: any;
};

export default function ({ options, label, style, classes, ...props }) {
  return (
    <FormControl style={style} classes={classes}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiButtonGroup color="secondary" variant="outlined" {...props}>
        {options.map((option, idx) => (
          <Button key={idx} onClick={option.onClick}>
            {option.label}
          </Button>
        ))}
      </MuiButtonGroup>
    </FormControl>
  );
}
