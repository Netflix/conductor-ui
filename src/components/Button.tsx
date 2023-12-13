import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";

export type ButtonProps = Omit<MuiButtonProps, "variant" | "component"> & {
  variant?: "primary" | "secondary" | "tertiary";
  // All other props
  [x: string]: any;
};

export default function Button({ variant = "primary", ...props }: ButtonProps) {
  if (variant === "secondary") {
    return <MuiButton color="secondary" variant="outlined" {...props} />;
  } else if (variant === "tertiary") {
    return <MuiButton {...props} />;
  } else {
    // primary or invalid
    return <MuiButton color="primary" variant="contained" {...props} />;
  }
}
