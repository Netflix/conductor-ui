import React from "react";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import _ from "lodash";

export default function ({ label, fullWidth, nullable = true, ...props }) {
  return (
    <FormControl fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        variant="outlined"
        fullWidth={fullWidth}
        displayEmpty={nullable}
        renderValue={(v) => (_.isNil(v) ? "" : v)}
        {...props}
      />
    </FormControl>
  );
}
