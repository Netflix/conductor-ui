import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import MuiLinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";

const useStyles = makeStyles({
  progress: {
    marginBottom: -4,
    zIndex: 999,
  },
});

export default function LinearProgress({
  className,
  ...props
}: LinearProgressProps) {
  const classes = useStyles();

  return (
    <MuiLinearProgress
      className={clsx([classes.progress, className])}
      {...props}
    />
  );
}
