import React, { useState } from "react";
import TaskConfigurator from "./TaskConfigurator"; // Update the import path
import { Button, Paper } from "../../components";

const TaskConfiguratorPage = () => {
  const [initialConfig, setInitialConfig] = useState({
    taskReferenceName: "simple_0",
    name: "simple_0",
    inputParameters: {},
    inputExpression: { x: 0 },
  });

  const handleResetClick = () => {
    setInitialConfig({
      taskReferenceName: "simple3",
      name: "simple3",
      inputParameters: {},
      inputExpression: { x: 3 },
    });
  };

  const [parentJsonState, setParentJsonState] = useState({}); // Initialize with appropriate initial state

  const handleTaskConfiguratorUpdate = (updatedState) => {
    setParentJsonState(updatedState);
  };

  return (
    <Paper padded>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%" }}>
          {/* Place any other components here */}
          <TaskConfigurator
            onUpdate={handleTaskConfiguratorUpdate}
            initialConfig={initialConfig}
          />
        </div>
        <div style={{ width: "50%" }}>
          <code>
            input
            <pre>{JSON.stringify(initialConfig, null, 2)}</pre>
          </code>
          <code>
            output
            <pre>{JSON.stringify(parentJsonState, null, 2)}</pre>
          </code>
          <Button onClick={handleResetClick}>Reset</Button>
        </div>
      </div>
    </Paper>
  );
};

export default TaskConfiguratorPage;
