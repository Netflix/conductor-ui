import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import NavLink from "./NavLink";

export type AppBarButtonType = MuiButtonProps & {
  selected: boolean;
  path: string;
};

export default function AppBarButton({ selected, path, ...rest }) {
  if (selected) {
    return (
      <MuiButton
        color="secondary"
        variant="outlined"
        component={NavLink}
        path={path}
        {...rest}
      />
    );
  } else {
    return (
      <MuiButton
        variant="text"
        color={"text" as any}
        component={NavLink}
        path={path}
        {...rest}
      />
    );
  }
}
