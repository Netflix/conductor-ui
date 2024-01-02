import { makeStyles } from "@mui/styles";
import React from "react";
import { IconButton, IconButtonProps, Theme, Tooltip } from "@mui/material";

const DIAMETER = 26;

type StyleProps = {
  color: string;
  hoverColor: string;
};

const useStyles = makeStyles<Theme, StyleProps>({
  root: {
    width: DIAMETER,
    height: DIAMETER,
    borderRadius: DIAMETER / 2,
    border: (props) => `2px solid ${props.color}`,
    backgroundColor: "#fff",
    cursor: "pointer",
    boxShadow: "0 0 5px #999",
    overflow: "hidden",
    transition: "0.3s",
    "&:hover": {
      backgroundColor: (props) => props.hoverColor,
      boxShadow: "0 0 5px #333",
    },
    fontSize: "18px",
  },
  disabled: {
    backgroundColor: "#fff !important",
    borderColor: "rgba(0, 0, 0, 0.26) !important",
  },
});

type DeleteButtonProps = Omit<IconButtonProps, "classes" | "color"> & {
  color: string;
  hoverColor: string;
  label: string;
};

export default function BuilderButton({
  color,
  hoverColor,
  label,
  ...props
}: DeleteButtonProps) {
  const classes = useStyles({ color, hoverColor });
  return (
    <Tooltip title={label} placement="right">
      <IconButton
        {...props}
        sx={{ color }}
        classes={{
          root: classes.root,
          disabled: classes.disabled,
        }}
      >
        {props.children}
      </IconButton>
    </Tooltip>
  );
}
