import { makeStyles } from "@mui/styles";
import Chip from "@mui/material/Chip";

type PillColor = "red" | "yellow" | "green";
type PillProps = {
  color: PillColor;
  label?: string;
}
const COLORS: { [key in PillColor]: string} = {
  red: "rgb(229, 9, 20)",
  yellow: "rgb(251, 164, 4)",
  green: "rgb(65, 185, 87)",
};

const useStyles = makeStyles({
  pill: {
    //borderColor: ({color}: {color: PillColor}) => COLORS[color],
    backgroundColor: ({color}: {color: PillColor}) => COLORS[color]
  },
});

export default function Pill({ color, label }: PillProps) {
  const classes = useStyles({ color });

  return (
    <Chip
      color="primary"
      variant="filled"
      label={label}
      classes={{ colorPrimary: classes.pill }}
    />
  );
}
