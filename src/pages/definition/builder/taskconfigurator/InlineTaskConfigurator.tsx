import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import JsonInput from "../../../../components/JsonInput";
import AttributeEditor from "./AttributeEditor";
import { inlineTaskSchema } from "../../../../schema/task/inlineTask";

const InlineTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();

  const [expression, setExpression] = useState<string>("");
  const [additionalInputParameters, setAdditionalInputParameters] =
    useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));

    const {
      expression = "",
      evaluatorType,
      ...updatedRest
    } = initialConfig.inputParameters || {};

    setExpression(expression);
    setAdditionalInputParameters(JSON.stringify(updatedRest));

    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = cloneDeep(taskLevelParams)!;
    const newInputParameters = {
      ...JSON.parse(additionalInputParameters),
      evaluatorType: newTaskConfig.inputParameters.evaluatorType,
      expression: expression,
    };
    newTaskConfig.inputParameters = newInputParameters;
    onUpdate(newTaskConfig);
  }, [onUpdate, taskLevelParams, expression, additionalInputParameters]);

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
          INLINE Task
        </Heading>
      </div>
      <AttributeEditor
        schema={inlineTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"INLINE"}
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
  const evaluatorType = params.inputParameters.evaluatorType;
  params.inputParameters = { evaluatorType: evaluatorType };
  return params;
};

export default InlineTaskConfigurator;
