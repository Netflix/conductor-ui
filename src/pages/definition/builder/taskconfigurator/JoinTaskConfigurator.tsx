import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import _, { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import AttributeEditor from "./AttributeEditor";
import { joinTaskSchema } from "../../../../schema/task/joinTask";

const JoinTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(taskLevelParams)!;

    onUpdate(newTaskConfig);
  }, [onUpdate, taskLevelParams]);

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
          JOIN Task
        </Heading>
      </div>
      <div>Double-click on value to edit</div>
      <AttributeEditor
        schema={joinTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"JOIN"}
      />
    </div>
  );
};

const extractTaskLevelParams = (taskConfig) => {
  const params = cloneDeep(taskConfig);
  delete params.inputExpression;
  return params;
};

export default JoinTaskConfigurator;
