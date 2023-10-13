import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  FormControl,
  InputLabel,
} from "@mui/material";
import _ from "lodash";

export type SelectProps<T> = Omit<
  MuiSelectProps<T>,
  "variant" | "displayEmpty"
> & {
  nullable?: boolean;
};

function defaultRenderValue(v) {
  return _.isNil(v) ? "" : String(v);
}

export default function Select<T>({
  label,
  fullWidth,
  renderValue = defaultRenderValue,
  nullable = true,
  ...props
}: SelectProps<T>) {
  return (
    <FormControl fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect<T>
        variant="outlined"
        fullWidth={fullWidth}
        displayEmpty={nullable}
        renderValue={renderValue}
        {...props}
      />
    </FormControl>
  );
}
