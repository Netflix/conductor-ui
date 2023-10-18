import Typography, { TypographyProps } from "@mui/material/Typography";

const levelMap: any[] = ["h6", "h5", "h4", "h3", "h2", "h1"];

export type HeadingProps = TypographyProps & {
  level?: number;
};

export default function Heading({ level = 3, ...props }) {
  return <Typography variant={levelMap[level]} {...props} />;
}
