import { colors } from "../theme/variables";

export default function NoTaskSelected({ text = "No task selected." }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.gray07,
      }}
    >
      {text}
    </div>
  );
}
