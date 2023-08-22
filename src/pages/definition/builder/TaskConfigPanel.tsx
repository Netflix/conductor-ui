import { useContext, useState } from "react";
import { DefEditorContext } from "../WorkflowDefinition";
import { Button, Paper } from "../../../components";
import HttpTaskConfigurator from "../../kitchensink/HttpTaskConfigurator";
import InlineTaskConfigurator from "../../kitchensink/InlineTaskConfigurator";
import TaskConfigurator from "../../kitchensink/TaskConfigurator";

// TODO: Placeholder for integration

export default function TaskConfigPanel() {
  const context = useContext(DefEditorContext)!;
  const { dag, selectedTask, setStaging } = context!;

  const taskConfig = selectedTask && dag.getTaskConfigByCoord(selectedTask);
  console.log(taskConfig);
  let originalRef = null;
  if (taskConfig) originalRef = JSON.parse(JSON.stringify(taskConfig)).taskReferenceName;

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

    setStaging(newDag.toWorkflowDef(), newDag);
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

    setStaging(newDag.toWorkflowDef(), newDag);
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

  const handleTaskConfiguratorUpdate = (updatedState) => {
    const newDag = dag.clone();
    console.log("updatedState", updatedState);
    console.log("originalRef", originalRef);
    if (originalRef)
    newDag.updateTask(originalRef, updatedState);
    setStaging(newDag.toWorkflowDef(), newDag);
  };

  return (
    <div > <Button onClick={modifyTaskChangeRef}>Modify Task (change ref)</Button>
          {taskConfig !== null && taskConfig.type === "HTTP" ? (
            <HttpTaskConfigurator
              onUpdate={handleTaskConfiguratorUpdate}
              initialConfig={taskConfig}
            />
          ) : taskConfig !== null && taskConfig.type === "INLINE" ? (
            <InlineTaskConfigurator
              onUpdate={handleTaskConfiguratorUpdate}
              initialConfig={taskConfig}
            />
          ) : (
            <TaskConfigurator
              onUpdate={handleTaskConfiguratorUpdate}
              initialConfig={taskConfig}
            />
          )}
      </div>
  );
}
