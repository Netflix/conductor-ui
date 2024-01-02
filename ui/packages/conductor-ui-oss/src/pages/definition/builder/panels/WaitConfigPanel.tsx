import { useCallback, useEffect, useState } from "react";
import { waitTaskSchema } from "../../../../schema/task/waitTask";
import JsonInput from "../../../../components/JsonInput";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { WaitIcon } from "../../../../components/diagram/icons/taskIcons";
import { normalizeObject } from "../../../../schema/schemaUtils";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

const WaitConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const classes = useStyles();
  const [durationOrUntil, setDurationOrUntil] = useState("duration");

  const [duration, setDuration] = useState<string>("");
  const [until, setUntil] = useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(waitTaskSchema, initialConfig));

    // Initialize inputExpression
    const duration = initialConfig?.inputParameters?.duration;
    setDuration(duration || "");

    const until = initialConfig?.inputParameters?.until;
    setUntil(until || "");

    setDurationOrUntil(
      initialConfig?.inputParameters?.until ? "until" : "duration",
    );

    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const newTaskConfig = { ...taskLevelParams, inputParameters: {} };

    if (durationOrUntil === "duration") {
      newTaskConfig.inputParameters = { duration: duration };
    } else if (durationOrUntil === "until") {
      newTaskConfig.inputParameters = { until: until };
    }

    onUpdate(newTaskConfig);
  }, [durationOrUntil, onUpdate, duration, until, taskLevelParams]);

  const handleTaskLevelParametersChange = useCallback(
    (obj) => {
      setTaskLevelParams(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleToggleButtonChange = useCallback((event, newSelection) => {
    setDurationOrUntil(newSelection);
  }, []);

  const handleDurationChange = useCallback(
    (v) => {
      setDuration(v!);
      onChanged(true);
    },
    [onChanged],
  );

  const handleUntilChange = useCallback(
    (v) => {
      setUntil(v!);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Wait Task"
      Icon={WaitIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Wait task is a no-op task that will remain IN_PROGRESS until after a
        certain duration or timestamp, at which point it will be marked as
        COMPLETED.
      </div>

      <AttributeTable
        schema={waitTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParametersChange}
      />

      <div
        className={classes.subHeader}
        style={{ marginBottom: 5, marginTop: 30 }}
      >
        Wait Type
      </div>
      <ToggleButtonGroup
        value={durationOrUntil}
        exclusive
        onChange={handleToggleButtonChange}
        size="small"
        style={{ marginBottom: "15px" }}
      >
        <ToggleButton value="duration">Duration</ToggleButton>
        <ToggleButton value="until">Until Timestamp</ToggleButton>
      </ToggleButtonGroup>

      {durationOrUntil === "duration" && (
        <JsonInput
          label={
            <span>
              Duration e.g.<code>10m20s</code>
            </span>
          }
          value={duration}
          onChange={handleDurationChange}
          language="plaintext"
        />
      )}
      {durationOrUntil === "until" && (
        <JsonInput
          label={
            <span>
              Until <code>yyyy-MM-dd HH:mm [z]</code>
            </span>
          }
          language="plaintext"
          value={until}
          onChange={handleUntilChange}
        />
      )}
    </PanelContainer>
  );
};

export default WaitConfigPanel;
