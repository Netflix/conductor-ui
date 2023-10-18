import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import JsonInput from "../../../../components/JsonInput";
import AttributeEditor from "./AttributeEditor";
import { subWorkflowTaskSchema } from "../../../../schema/task/subWorkflowTask";

const SubWorkflowTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();

  const [inputParameters, setInputParameters] = useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [taskToDomain, setTaskToDomain] = useState<string>("{}");
  const [workflowDefinition, setWorkflowDefinition] = useState<string>("{}");

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));

    setInputParameters(JSON.stringify(initialConfig.inputParameters) || "{}");

    if ("subWorkflowParam" in initialConfig) {
      setTaskToDomain(
        JSON.stringify(initialConfig.subWorkflowParam.taskToDomain) || "{}",
      );
      setWorkflowDefinition(
        JSON.stringify(initialConfig.subWorkflowParam.workflowDefinition) ||
          "{}",
      );
    }

    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = cloneDeep(taskLevelParams)!;
    newTaskConfig.inputParameters = JSON.parse(inputParameters);
    newTaskConfig.subWorkflowParam.taskToDomain = JSON.parse(taskToDomain);
    newTaskConfig.subWorkflowParam.workflowDefinition =
      JSON.parse(workflowDefinition);
    onUpdate(newTaskConfig);
  }, [
    onUpdate,
    taskLevelParams,
    inputParameters,
    taskToDomain,
    workflowDefinition,
  ]);

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
          SUB_WORKFLOW Task
        </Heading>
      </div>
      <AttributeEditor
        schema={subWorkflowTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"SUB_WORKFLOW"}
      />

      <JsonInput
        key="taskToDomain"
        label="taskToDomain"
        value={taskToDomain}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setTaskToDomain(v!);
          onChanged(true);
        }}
      />

      <JsonInput
        key="workflowDefinition"
        label="workflowDefinition"
        value={workflowDefinition}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setWorkflowDefinition(v!);
          onChanged(true);
        }}
      />
      <JsonInput
        key="inputParameters"
        label="inputParameters"
        value={inputParameters}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setInputParameters(v!);
          onChanged(true);
        }}
      />
    </div>
  );
};

const extractTaskLevelParams = (taskConfig) => {
  const params = cloneDeep(taskConfig);
  delete params.inputExpression;
  return params;
};

export default SubWorkflowTaskConfigurator;
