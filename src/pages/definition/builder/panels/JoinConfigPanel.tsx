import { useCallback, useEffect, useState } from "react";
import { joinTaskSchema } from "../../../../schema/task/joinTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import JsonInput from "../../../../components/JsonInput";
import { JoinTaskConfig } from "../../../../types/workflowDef";

const JoinConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [joinOn, setJoinOn] = useState<string>("[]");

  // Initialize data sources and state
  useEffect(() => {
    const config = initialConfig as JoinTaskConfig;
    setTaskLevelParams(normalizeObject(joinTaskSchema, initialConfig));
    setJoinOn(config.joinOn ? JSON.stringify(config.joinOn, null, 2) : "[]");
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = {
      ...taskLevelParams,
      joinOn: parseWithDefault(joinOn),
      inputParameters: {}, // unused but must be present
    };

    onUpdate(newTaskConfig);
  }, [joinOn, onUpdate, taskLevelParams]);

  const handleTaskLevelParamsChange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

  const handleJoinOnChange = useCallback(
    (val) => {
      setJoinOn(val);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer tabId={tabId} handleApply={handleApply} heading="Join Task">
      <div style={{ marginBottom: 15 }}>
        The Join task is used in conjunction with a Static or Dynamic Fork task.
        Each of the aggregated task outputs is given a corresponding key in the
        JOIN task output. This task is configured automatically when you create
        one of the above tasks.
      </div>
      <AttributeTable
        schema={joinTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />

      <div style={{ marginTop: 15 }}>
        Note: <code>joinOn</code> should be empty when following a Dynamic Fork.
        However, it must be populated manually to contain the refs of the final
        task in each branch of a Static Fork. If a preceding SWITCH is present,
        that Switch task must be followed by an EXCLUSIVE_JOIN, otherwise this
        JOIN task may get stuck and never complete.
      </div>
      <JsonInput
        style={{ marginTop: 15 }}
        label="Join On"
        language="json"
        value={joinOn}
        onChange={handleJoinOnChange}
      />
    </PanelContainer>
  );
};

export default JoinConfigPanel;
