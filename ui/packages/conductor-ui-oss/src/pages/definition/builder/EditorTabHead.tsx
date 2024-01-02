import { useContext } from "react";
import { DefEditorContext } from "../WorkflowDefinition";

export type EditorTabSeverity = "ERROR" | "WARNING" | "INFO" | undefined;

type EditorTabHeadProps = {
  text: string;
  tabId: string;
};

export default function EditorTabHead({ tabId, text }: EditorTabHeadProps) {
  const { changes } = useContext(DefEditorContext)!;
  const severity = changes[tabId];

  let dotColor;
  if (severity === "ERROR") {
    dotColor = "red";
  } else if (severity === "WARNING") {
    dotColor = "orange";
  } else if (severity !== undefined) {
    dotColor = "rgba(0, 128, 255, 0.6)";
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: "5px" }}>{text}</span>
      {!!severity && (
        <div
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: dotColor,
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}
