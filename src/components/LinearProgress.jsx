import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import LinearProgress from "@mui/material/LinearProgress";

const useStyles = makeStyles({
  progress: {
    marginBottom: -4,
    zIndex: 999,
  },
});

export default function ({ className, ...props }) {
  const classes = useStyles();

  return (
    <LinearProgress
      className={clsx([classes.progress, className])}
      {...props}
    />
  );
}
