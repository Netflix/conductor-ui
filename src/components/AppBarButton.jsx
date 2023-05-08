import { Button as MuiButton } from "@mui/material";
import NavLink from "./NavLink";

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
        color="text"
        variant="text"
        component={NavLink}
        path={path}
        {...rest}
      />
    );
  }
}
