import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";

import theme from "./theme";

export default ({ children, ...rest }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme} {...rest}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
