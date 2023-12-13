import { useCallback, useEffect, useState } from "react";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { HumanIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { humanTaskSchema } from "../../../../schema/task/humanTask";
import { normalizeObject } from "../../../../schema/schemaUtils";

const HumanConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(humanTaskSchema, initialConfig));
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    onUpdate({
      ...taskLevelParams,
      inputParameters: {}, // unused but must be present
    });
  }, [onUpdate, taskLevelParams]);

  const handleTaskLevelParamsChange = useCallback(
    (obj) => {
      setTaskLevelParams(obj);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Human Task"
      Icon={HumanIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Human task is used when the workflow needs to be paused for an
        external signal to continue. It acts as a gate that remains in the
        IN_PROGRESS state until marked as COMPLETED or FAILED via an Update Task
        API call.
      </div>

      <AttributeTable
        schema={humanTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />
    </PanelContainer>
  );
};

export default HumanConfigPanel;
