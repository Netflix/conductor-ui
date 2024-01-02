import React from "react";
import { TextField } from "@mui/material";
import { useField } from "formik";

export default function (props) {
  const [field, meta] = useField(props);

  return (
    <TextField
      error={!!(meta.touched && meta.error)}
      helperText={meta.tocuhed && meta.error}
      {...field}
      {...props}
    />
  );
}
