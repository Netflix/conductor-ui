import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import _, { add, cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import ParameterExpressionToggle from "./ParameterExpressionToggle";
import AttributeEditor from "./AttributeEditor";
import { JQTransformTaskSchema } from "../../../../schema/task/JQTransformTask";
import JsonInput from "../../../../components/JsonInput";

const JQTransformTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [queryExpression, setQueryExpression] = useState<string>("{}");
  const [additionalInputParameters, setAdditionalInputParameters] =
    useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));
    // Initialize inputExpression
    const { queryExpression, ...rest } = initialConfig.inputParameters || {};
    setQueryExpression(queryExpression);
    setAdditionalInputParameters(JSON.stringify(rest));
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(taskLevelParams)!;

    const newInputParameters = {
      ...JSON.parse(additionalInputParameters),
      queryExpression: queryExpression,
    };
    newTaskConfig.inputParameters = newInputParameters;
    console.log(newTaskConfig);

    onUpdate(newTaskConfig);
  }, [
    initialConfig,
    onUpdate,
    taskLevelParams,
    queryExpression,
    additionalInputParameters,
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
      <div>Double-click on value to edit</div>
      <AttributeEditor
        schema={JQTransformTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"JQ_TRANSFORM"}
      />

      <JsonInput
        key="queryExpression"
        label="queryExpression"
        value={queryExpression}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setQueryExpression(v!);
          onChanged(true);
        }}
        language="javascript"
      />
      <JsonInput
        key="additionalInputParameters"
        label="Additional inputParameters"
        value={additionalInputParameters}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setAdditionalInputParameters(v!);
          onChanged(true);
        }}
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

export default JQTransformTaskConfigurator;
