import React, { useState } from "react";
import TaskConfigurator from "./TaskConfigurator"; // Update the import path
import { Button, Paper } from "../../components";
import InlineTaskConfigurator from "./InlineTaskConfigurator";

const TaskConfiguratorPage = () => {
    const sampleInlineTask = {
        taskReferenceName: "inline_0",
        name: "inline_0",
        inputParameters: {
            "evaluatorType": "javascript",
            "expression": "function scriptFun(){if ($.val){ return $.val + 1; } else { return 0; }} scriptFun()",
            "x": 3
          },
        description: "description1",
        type: "INLINE"
      }
    
      const sampleSimpleTask = {
        taskReferenceName: "simple_0",
        name: "simple_0",
        inputParameters: {
          },
        inputExpression:  {
            "expression": "workflow.input",
            "type": "JSON_PATH"
          },
        type: "SIMPLE"
      }
    
  const [initialConfig, setInitialConfig] = useState(sampleSimpleTask);

  

  const handleResetClick = () => {
    setInitialConfig({
        taskReferenceName: "inline_2",
        name: "inline_2",
        inputParameters: {
            "evaluatorType": "javascript",
            "expression": "function scriptFun()",
            "x": 5
          },
        description: "description1",
        type: "INLINE"
    })
  };

  const [parentJsonState, setParentJsonState] = useState({}); // Initialize with appropriate initial state

  const handleTaskConfiguratorUpdate = (updatedState) => {
    setParentJsonState(updatedState);
  };
  console.log(initialConfig);

  return (
    <Paper padded>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%" }}>
        {initialConfig.type === 'INLINE' ? 
                        <InlineTaskConfigurator
                            onUpdate={handleTaskConfiguratorUpdate}
                            initialConfig={initialConfig}
                        />
                    :
                        <TaskConfigurator
                            onUpdate={handleTaskConfiguratorUpdate}
                            initialConfig={initialConfig}
                        />
                    }
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
