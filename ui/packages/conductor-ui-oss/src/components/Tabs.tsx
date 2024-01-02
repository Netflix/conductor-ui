import React from "react";
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
  TabProps as MuiTabProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { colors } from "../theme/variables";
import theme from "../theme/theme";

export type TabsProps = MuiTabsProps & {
  contextual?: boolean;
};

// Override styles for 'Contextual' tabs
const useContextualTabStyles = makeStyles({
  root: {
    color: colors.gray02,
    textTransform: "none",
    height: 38,
    minHeight: 38,
    padding: "12px 16px",
    backgroundColor: colors.gray13,
    [theme.breakpoints.up("md")]: {
      minWidth: 0,
    },
    width: "auto",
    "&:hover": {
      backgroundColor: colors.grayXLight,
      color: colors.gray02,
    },
  },
  selected: {
    backgroundColor: "white",
    color: `${colors.black} !important`,
    "&:hover": {
      backgroundColor: "white",
      color: colors.black,
    },
  },
  wrapper: {
    width: "auto",
  },
});

const useContextualTabsStyles = makeStyles({
  indicator: {
    height: 0,
  },
  flexContainer: {
    backgroundColor: colors.gray13,
  },
});

export default function Tabs({
  contextual = false,
  children,
  ...props
}: TabsProps) {
  const classes = useContextualTabsStyles();
  return (
    <MuiTabs
      variant="scrollable"
      classes={contextual && classes}
      indicatorColor="primary"
      {...props}
    >
      {contextual
        ? Array.isArray(children)
          ? children.map((child, idx) =>
              React.cloneElement(child, { contextual: true, key: idx }),
            )
          : null
        : children}
    </MuiTabs>
  );
}

export function Tab({ contextual = false, ...props }) {
  const classes = useContextualTabStyles();
  return <MuiTab classes={contextual && classes} {...props} />;
}
