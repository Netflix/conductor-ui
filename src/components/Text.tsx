import Typography, { TypographyProps } from "@mui/material/Typography";

const levelMap = ["caption", "body2", "body1"];

interface TextProps extends TypographyProps {
  level?: number;
}

export default function Text({ level = 1, ...props }: TextProps) {
  return <Typography variant={levelMap[level] as any} {...props} />;
}
