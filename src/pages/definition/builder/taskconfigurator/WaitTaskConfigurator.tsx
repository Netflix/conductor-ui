import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { useStyles } from "./TaskConfiguratorUtils";
import AttributeEditor from "./AttributeEditor";
import { waitTaskSchema } from "../../../../schema/task/waitTask";
import JsonInput from "../../../../components/JsonInput";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const WaitTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();

  const [durationOrUntil, setDurationOrUntil] = useState("duration");

  const [duration, setDuration] = useState<string>("");
  const [until, setUntil] = useState<string>("{}");

  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(extractTaskLevelParams(initialConfig));
    // Initialize inputExpression
    const duration = initialConfig.inputParameters.duration;
    setDuration(duration || "");

    const until = initialConfig.inputParameters.until;
    setUntil(until || "");
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  useEffect(() => {
    if (
      !initialConfig.inputParameters.until &&
      !initialConfig.inputParameters.duration
    ) {
      return;
    } else if (
      initialConfig.inputParameters.until &&
      !initialConfig.inputParameters.duration
    ) {
      setDurationOrUntil("until");
    } else if (
      !initialConfig.inputParameters.until &&
      initialConfig.inputParameters.duration
    ) {
      setDurationOrUntil("duration");
    } else if (
      initialConfig.inputParameters.until.length >
      initialConfig.inputParameters.duration.length
    ) {
      setDurationOrUntil("until");
    } else setDurationOrUntil("duration");
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = cloneDeep(taskLevelParams)!;

    if (durationOrUntil === "duration") {
      newTaskConfig.inputParameters = { duration: duration };
      delete newTaskConfig.inputParameters.until;
    } else if (durationOrUntil === "until") {
      newTaskConfig.inputParameters = { until: until };
      delete newTaskConfig.inputParameters.duration;
    }

    onUpdate(newTaskConfig);
  }, [durationOrUntil, onUpdate, duration, until, taskLevelParams]);

  const initialTaskLevelParams = useMemo(
    () => extractTaskLevelParams(initialConfig),
    [initialConfig],
  );

  const handleOnchange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

  const handleToggleButtonChange = (event, newSelection) => {
    setDurationOrUntil(newSelection);
  };

  return (
    <div className={classes.container}>
      <div>
        <div style={{ float: "right" }}>
          <Button onClick={handleApply}>Apply</Button>
        </div>
        <Heading level={1} gutterBottom>
          WAIT Task
        </Heading>
      </div>
      <AttributeEditor
        schema={waitTaskSchema}
        initialTaskLevelParams={initialTaskLevelParams}
        onChange={handleOnchange}
        taskType={"WAIT"}
      />

      <ToggleButtonGroup
        value={durationOrUntil}
        exclusive
        onChange={handleToggleButtonChange}
        size="small"
        style={{ marginBottom: "15px" }}
      >
        <ToggleButton value="duration">
          Use duration in inputParameters
        </ToggleButton>
        <ToggleButton value="until">Use until in inputParameters</ToggleButton>
      </ToggleButtonGroup>

      {durationOrUntil === "duration" && (
        <JsonInput
          key="duration"
          label="duration"
          value={duration}
          onChange={(v) => {
            setDuration(v!);
            onChanged(true);
          }}
          language="plaintext"
        />
      )}
      {durationOrUntil === "until" && (
        <JsonInput
          key="until"
          label="until"
          language="plaintext"
          value={until}
          onChange={(v) => {
            setUntil(v!);
            onChanged(true);
          }}
        />
      )}
    </div>
  );
};

const extractTaskLevelParams = (taskConfig) => {
  const params = cloneDeep(taskConfig);
  delete params.inputExpression;
  delete params.inputParameters;
  return params;
};

export default WaitTaskConfigurator;
