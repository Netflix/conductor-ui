import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import JsonInput from "../../../../components/JsonInput";
import AttributeEditor from "./AttributeEditor";
import DecisionCasesEditor from "./DecisionCasesEditor";
import { SwitchTaskSchema } from "../../../../schema/task/switchTask";

const SwitchTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();

  const [expression, setExpression] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [decisionCases, setDecisionCases] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));

    if ("decisionCases" in initialConfig)
      setDecisionCases(initialConfig.decisionCases || {});

    if ("expression" in initialConfig)
      setExpression(initialConfig.expression || "");

    const inputParameters = JSON.stringify(initialConfig.inputParameters);
    setInputParameters(inputParameters || "{}");

    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = cloneDeep(taskLevelParams)!;

    newTaskConfig.expression = expression;
    newTaskConfig.inputParameters = JSON.parse(inputParameters);
    newTaskConfig.decisionCases = decisionCases;
    console.log(newTaskConfig);
    onUpdate(newTaskConfig);
  }, [
    onUpdate,
    taskLevelParams,
    expression,
    inputParameters,
    decisionCases,
  ]);

  const initialTaskLevelParams = useMemo(
    () => extractTaskLevelParams(initialConfig),
    [initialConfig],
  );

  console.log(initialConfig);

  const handleTaskLevelOnchange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

  const handleDecisionCasesOnchange = (updatedJson) => {
    setDecisionCases(updatedJson);
    onChanged(true);
  };

  return (
    <div className={classes.container}>
      <div>
        <div style={{ float: "right" }}>
          <Button onClick={handleApply}>Apply</Button>
        </div>
        <Heading level={1} gutterBottom>
          SWITCH Task
        </Heading>
      </div>
      <div>Double-click on value to edit</div>
      <AttributeEditor
        schema={SwitchTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleTaskLevelOnchange}
        taskType={"SWITCH"}
      />

      <DecisionCasesEditor
        initialDecisionCases={decisionCases}
        onChange={handleDecisionCasesOnchange}
      />

      <JsonInput
        key="expression"
        label="expression"
        value={expression}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setExpression(v!);
          onChanged(true);
        }}
        language="javascript"
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
  console.log(taskConfig);
  return params;
};

export default SwitchTaskConfigurator;
