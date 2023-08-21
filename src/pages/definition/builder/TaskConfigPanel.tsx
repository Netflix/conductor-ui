import { useContext } from "react";
import { DefEditorContext } from "../WorkflowDefinition";

// TODO: Placeholder for integration

export default function TaskConfigPanel() {
  const context = useContext(DefEditorContext)!;
  const { dag, selectedTask } = context!;

  const taskResult = selectedTask && dag.getTaskConfigByCoord(selectedTask);

  if (!selectedTask) {
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
        <div>Select a task by clicking on it in the Workflow Builder.</div>
      </div>
    );
  }

  return (
    <div style={{ margin: 15 }}>
      <div>Selected Task: {JSON.stringify(selectedTask)}</div>
      <div>Resolved via DAG</div>
      <pre>
        <code>{JSON.stringify(taskResult, null, 2)}</code>
      </pre>
    </div>
  );
}
