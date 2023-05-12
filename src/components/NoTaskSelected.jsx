import { colors } from "../theme/variables";

export default function NoTaskSelected() {
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
      No task selected.
    </div>
  );
}
