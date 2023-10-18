import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import _, { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { simpleTaskSchema } from "../../../../schema/task/simpleTask";
import { useStyles } from "./TaskConfiguratorUtils";
import ParameterExpressionToggle from "./ParameterExpressionToggle";
import AttributeEditor from "./AttributeEditor";

const SimpleTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");

  const [inputExpression, setInputExpression] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<string>("{}");

  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));
    // Initialize inputExpression
    const inputExpression = initialConfig.inputExpression?.expression;
    setInputExpression(inputExpression || "");

    const inputParameters = JSON.stringify(initialConfig.inputParameters);
    setInputParameters(inputParameters || "{}");
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  useEffect(() => {
    if (!initialConfig.inputExpression && !initialConfig.inputParameters) {
      return;
    } else if (!initialConfig.inputExpression)
      setParameterOrExpression("parameter");
    else if (!initialConfig.inputParameters)
      setParameterOrExpression("expression");
    else if (
      JSON.stringify(initialConfig.inputExpression).length >
      JSON.stringify(initialConfig.inputParameters).length
    ) {
      setParameterOrExpression("expression");
    } else setParameterOrExpression("parameter");
  }, [initialConfig.inputExpression, initialConfig.inputParameters]);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(taskLevelParams)!;

    if (parameterOrExpression === "parameter") {
      newTaskConfig.inputParameters = JSON.parse(inputParameters);
      newTaskConfig.inputExpression = { type: "JSON_PATH", expression: "" };
      delete newTaskConfig["inputExpression"];
    } else if (parameterOrExpression === "expression") {
      newTaskConfig.inputExpression = {
        type: "JSON_PATH",
        expression: inputExpression,
      };
      delete newTaskConfig["inputParameters"];
    }

    onUpdate(newTaskConfig);
  }, [
    parameterOrExpression,
    onUpdate,
    inputExpression,
    inputParameters,
    taskLevelParams,
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
          SIMPLE Task
        </Heading>
      </div>
      <AttributeEditor
        schema={simpleTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"SIMPLE"}
      />

      <ParameterExpressionToggle
        parameterOrExpression={parameterOrExpression}
        setParameterOrExpression={setParameterOrExpression}
        inputParameters={inputParameters}
        setInputParameters={setInputParameters}
        inputExpression={inputExpression}
        setInputExpression={setInputExpression}
        onChange={onChanged}
      />
    </div>
  );
};

const extractTaskLevelParams = (taskConfig) => {
  const params = cloneDeep(taskConfig);
  delete params.inputExpression;
  delete params.inputParameters;
  return params;
};

export default SimpleTaskConfigurator;
