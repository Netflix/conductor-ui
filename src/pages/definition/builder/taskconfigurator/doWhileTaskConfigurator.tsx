import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import _, { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import AttributeEditor from "./AttributeEditor";
import { doWhileTaskSchema } from "../../../../schema/task/doWhileTask";
import JsonInput from "../../../../components/JsonInput";

const DoWhileTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [loopCondition, setLoopCondition] = useState<string>("");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [inputParameters, setInputParameters] = useState<string>("{}");

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));
    if ("loopCondition" in initialConfig) {
      const loopCondition = initialConfig.loopCondition || "";
      setLoopCondition(loopCondition);
    }
    setInputParameters(JSON.stringify(initialConfig.inputParameters));
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(taskLevelParams)!;

    newTaskConfig.loopCondition = loopCondition;
    newTaskConfig.inputParameters = JSON.parse(inputParameters);

    console.log(newTaskConfig);

    onUpdate(newTaskConfig);
  }, [
    onUpdate,
    inputParameters,
    taskLevelParams,
    loopCondition,
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
        schema={doWhileTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"DO_WHILE"}
      />

      <JsonInput
        key="loopCondition"
        label="loopCondition"
        language="javascript"
        value={loopCondition}
        style={{ marginBottom: "15px" }}
        onChange={(v) => {
          setLoopCondition(v!);
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
  delete params.inputParameters;
  delete params.loopCondition;
  //   delete params.loopOver;
  return params;
};

export default DoWhileTaskConfigurator;
