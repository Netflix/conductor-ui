import React, { useState } from "react";
import TaskConfigurator from "../definition/builder/taskconfigurator/TaskConfigurator"; // Update the import path
import { Button, Paper } from "../../components";
import InlineTaskConfigurator from "../definition/builder/taskconfigurator/InlineTaskConfigurator";
import HttpTaskConfigurator from "../definition/builder/taskconfigurator/HttpTaskConfigurator";

const TaskConfiguratorPage = () => {
  const sampleInlineTask = {
    taskReferenceName: "inline_0",
    name: "inline_0",
    inputParameters: {
      evaluatorType: "javascript",
      expression:
        "function scriptFun(){if ($.val){ return $.val + 1; } else { return 0; }} scriptFun()",
      x: 3,
    },
    description: "description1",
    type: "INLINE",
  };

  const sampleSimpleTask = {
    taskReferenceName: "simple_0",
    name: "simple_0",
    inputParameters: {},
    inputExpression: {
      expression: "workflow.input",
      type: "JSON_PATH",
    },
    type: "SIMPLE",
  };

  const sampleHttpTask = {
    taskReferenceName: "http_0",
    name: "http_0",
    inputParameters: {
      http_request: {
        uri: "https://jsonplaceholder.typicode.com/posts/",
        method: "POST",
        body: {
          title: "${get_example.output.response.body.title}",
          userId: "${get_example.output.response.body.userId}",
          action: "doSomething",
        },
        headers: {
          title: "${get_example.output.response.body.title}",
          userId: "${get_example.output.response.body.userId}",
          action: "doSomething",
        },
      },
    },
    type: "HTTP",
  };

  const [initialConfig, setInitialConfig] = useState(sampleSimpleTask);

  const handleResetClick = () => {
    setInitialConfig({
      taskReferenceName: "simple_0",
      name: "simple_0",
      inputParameters: {},
      inputExpression: {
        expression: "workflow.input",
        type: "JSON_PATH",
      },
      type: "SIMPLE",
    });
  };

  const [parentJsonState, setParentJsonState] = useState({}); // Initialize with appropriate initial state

  const handleTaskConfiguratorUpdate = (updatedState) => {
    setParentJsonState(updatedState);
  };
  console.log(initialConfig);
  console.log(parentJsonState);

  return (
    <Paper padded style={{ maxHeight: "100vh", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%" }}>
          {initialConfig.type === "HTTP" ? (
            <HttpTaskConfigurator
              onUpdate={handleTaskConfiguratorUpdate}
              initialConfig={initialConfig}
            />
          ) : initialConfig.type === "INLINE" ? (
            <InlineTaskConfigurator
              onUpdate={handleTaskConfiguratorUpdate}
              initialConfig={initialConfig}
            />
          ) : (
            <TaskConfigurator
              onUpdate={handleTaskConfiguratorUpdate}
              initialConfig={initialConfig}
            />
          )}
        </div>
        <div style={{ width: "50%" }}>
          <code>
            input
            <pre style={{ fontSize: "10px" }}>
              {JSON.stringify(initialConfig, null, 2)}
            </pre>
          </code>
          <code>
            output
            <pre style={{ fontSize: "10px" }}>
              {JSON.stringify(parentJsonState, null, 2)}
            </pre>
          </code>
          <Button onClick={handleResetClick}>Reset</Button>
        </div>
      </div>
    </Paper>
  );
};

export default TaskConfiguratorPage;
