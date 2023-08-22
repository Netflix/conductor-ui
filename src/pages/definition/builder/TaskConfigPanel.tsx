import { useContext } from "react";
import { DefEditorContext } from "../WorkflowDefinition";
import { Button } from "../../../components";

// TODO: Placeholder for integration

export default function TaskConfigPanel({ setSeverity }: { setSeverity: (EditorTabSeverity ) => void}) {
  const context = useContext(DefEditorContext)!;
  const { dag, selectedTask, setStaging } = context!;

  const taskConfig = selectedTask && dag.getTaskConfigByCoord(selectedTask);

  function setChange(){
    setSeverity("WARNING");
  }

  function clearChange(){
    setSeverity(undefined);
  }

  function modifyTaskChangeRef() {
    const newDag = dag.clone();
    newDag.updateTask("get_population_data", {
      name: "get_population_data",
      taskReferenceName: "get_population_data_NEW",
      inputParameters: {
        http_request: {
          uri: "https://datausa.io/api/data?drilldowns=Nation&measures=Population",
          method: "GET",
        },
      },
      type: "HTTP",
    });

    setStaging("TaskConfigPanel", newDag.toWorkflowDef(), newDag);
  }

  function modifyTask() {
    const newDag = dag.clone();
    newDag.updateTask("get_population_data", {
      name: "get_population_data_NEW",
      taskReferenceName: "get_population_data",
      inputParameters: {
        http_request: {
          uri: "https://google.com",
          method: "GET",
        },
      },
      type: "HTTP",
    });

    setStaging("TaskConfigPanel", newDag.toWorkflowDef(), newDag);
  }

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
      <Button onClick={modifyTask}>Modify Task</Button>
      <Button onClick={modifyTaskChangeRef}>Modify Task (change ref)</Button>
      <Button onClick={setChange}>Set Change</Button>
      <Button onClick={clearChange}>Clear Change</Button>
      <pre>
        <code>{JSON.stringify(taskConfig, null, 2)}</code>
      </pre>
    </div>
  );
}
