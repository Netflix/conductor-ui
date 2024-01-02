import { colors } from "../theme/variables";

export type BlankProps = {
  children?: React.ReactNode;
  center?: boolean;
};

export default function Blank({
  children = "No task selected.",
  center = true,
}: BlankProps) {
  let style = {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
    display: "flex",
    color: colors.gray07,
    flexDirection: "column" as any,
  };

  if (center) {
    style = {
      ...style,
      ...{
        alignItems: "center",
        justifyContent: "center",
      },
    };
  }

  return <div style={style}>{children}</div>;
}
