import { makeStyles } from "@mui/styles";
import Chip from "@mui/material/Chip";
import { colors } from "../theme/variables";
import React from "react";
import { Tooltip } from "@mui/material";

type PillColor = "red" | "yellow" | "green" | "blue";
type PillProps = {
  color?: PillColor;
  label?: string;
  variant?: "filled" | "outlined";
  tooltip?: string;
};
const COLORS: { [key in PillColor]: string } = {
  red: "rgb(229, 9, 20)",
  yellow: "rgb(251, 164, 4)",
  green: "rgb(65, 185, 87)",
  blue: colors.brand,
};

const useStyles = makeStyles({
  colorPrimary: {
    backgroundColor: ({ color }: { color: PillColor }) =>
      color && COLORS[color],
  },
  outlinedPrimary: {
    borderColor: ({ color }: { color: PillColor }) => color && COLORS[color],
    color: ({ color }: { color: PillColor }) => color && COLORS[color],
  },
});

const Pill = ({ color, label, tooltip, variant = "filled" }: PillProps) => {
  const classes = useStyles({ color: color || "blue" });

  let overrideClasses;
  if (variant === "filled") {
    overrideClasses = {
      colorPrimary: classes.colorPrimary,
    };
  } else {
    overrideClasses = {
      outlinedPrimary: classes.outlinedPrimary,
    };
  }

  return (
    <Tooltip title={tooltip}>
      <Chip
        color={(color as any) || "primary"}
        variant={variant}
        label={label}
        classes={overrideClasses}
      />
    </Tooltip>
  );
};

export default Pill;
