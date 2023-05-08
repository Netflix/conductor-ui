import { makeStyles } from "@mui/styles";
import Chip from "@mui/material/Chip";

const COLORS = {
  red: "rgb(229, 9, 20)",
  yellow: "rgb(251, 164, 4)",
  green: "rgb(65, 185, 87)",
};

const useStyles = makeStyles({
  pill: {
    borderColor: (props) => COLORS[props.color],
    color: (props) => COLORS[props.color],
  },
});

export default function Pill({ color, ...props }) {
  const classes = useStyles({ color });

  return (
    <Chip
      color={color}
      variant="outlined"
      {...props}
      classes={{ colorPrimary: classes.pill }}
    />
  );
}
