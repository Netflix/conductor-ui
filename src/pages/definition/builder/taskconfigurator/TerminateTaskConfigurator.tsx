import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import JsonInput from "../../../../components/JsonInput";
import AttributeEditor from "./AttributeEditor";
import { terminateTaskSchema } from "../../../../schema/task/terminateTask";

const TerminateTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();

  const [workflowOutput, setWorkflowOutput] = useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));

    const workflowOutput = JSON.stringify(
      initialConfig.inputParameters.workflowOutput,
    );
    setWorkflowOutput(workflowOutput || "{}");

    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = cloneDeep(taskLevelParams)!;
    newTaskConfig.inputParameters.workflowOutput = JSON.parse(workflowOutput);
    onUpdate(newTaskConfig);
  }, [onUpdate, taskLevelParams, workflowOutput]);

  const initialTaskLevelParams = useMemo(
    () => extractTaskLevelParams(initialConfig),
    [initialConfig],
  );

  const handleOnchange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

  return (
    <div className={classes.container}>
      <div>
        <div style={{ float: "right" }}>
          <Button onClick={handleApply}>Apply</Button>
        </div>
        <Heading level={1} gutterBottom>
          TERMINATE Task
        </Heading>
      </div>
      <AttributeEditor
        schema={terminateTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"TERMINATE"}
      />

      <JsonInput
        key="workflowOutput"
        label="workflowOutput"
        value={workflowOutput}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setWorkflowOutput(v!);
          onChanged(true);
        }}
      />
    </div>
  );
};

const extractTaskLevelParams = (taskConfig) => {
  const params = cloneDeep(taskConfig);
  delete params.inputExpression;
  delete params.inputParameters.workflowOutput;
  return params;
};

export default TerminateTaskConfigurator;
