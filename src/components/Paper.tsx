import React from "react";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import Paper, { PaperProps as RawPaperProps } from "@mui/material/Paper";

const useStyles = makeStyles({
  padded: {
    padding: 15,
  },
});

interface PaperProps extends RawPaperProps {
  padded?: boolean;
}

export default React.forwardRef<HTMLDivElement, PaperProps>(
  ({ padded = false, className, ...props }, ref) => {
    const classes = useStyles();
    const internalClassName: string[] = [];
    if (padded) internalClassName.push(classes.padded);
    return (
      <Paper
        ref={ref}
        className={clsx([internalClassName, className])}
        {...props}
      />
    );
  },
);
