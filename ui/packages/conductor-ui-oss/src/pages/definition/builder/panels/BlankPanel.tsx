import { ReactNode } from "react";

export type BlankPanelProps = {
  message?: ReactNode;
};

export default function BlankPanel({ message }: BlankPanelProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#fafafd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        {message || "Select a task by clicking on it in the Workflow Builder."}
      </div>
    </div>
  );
}
