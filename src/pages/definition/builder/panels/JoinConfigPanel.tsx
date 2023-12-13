import { useCallback, useEffect, useState } from "react";
import { joinTaskSchema } from "../../../../schema/task/joinTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { normalizeObject } from "../../../../schema/schemaUtils";

const JoinConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(joinTaskSchema, initialConfig));
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = {
      ...taskLevelParams,
      inputParameters: {}, // unused but must be present
    };

    onUpdate(newTaskConfig);
  }, [onUpdate, taskLevelParams]);

  const handleTaskLevelParamsChange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

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
    </PanelContainer>
  );
};

export default JoinConfigPanel;
