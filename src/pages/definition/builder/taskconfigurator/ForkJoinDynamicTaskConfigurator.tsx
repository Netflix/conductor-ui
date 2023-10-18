import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import _, { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import AttributeEditor from "./AttributeEditor";
import JsonInput from "../../../../components/JsonInput";
import { forkJoinDynamicTaskSchema } from "../../../../schema/task/forkJoinDynamicTask";

const ForkJoinDynamicTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [inputParameters, setInputParameters] = useState<string>("{}");

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));
    setInputParameters(JSON.stringify(initialConfig.inputParameters));
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(taskLevelParams)!;

    newTaskConfig.inputParameters = JSON.parse(inputParameters);

    onUpdate(newTaskConfig);
  }, [onUpdate, inputParameters, taskLevelParams]);

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
          FORK_JOIN_DYNAMIC Task
        </Heading>
      </div>
      <AttributeEditor
        schema={forkJoinDynamicTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"FORK_JOIN_DYNAMIC"}
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

export default ForkJoinDynamicTaskConfigurator;
