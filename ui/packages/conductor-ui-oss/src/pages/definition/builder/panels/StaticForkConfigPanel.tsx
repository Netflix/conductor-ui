import { useCallback, useEffect, useState } from "react";
import { forkJoinTaskSchema } from "../../../../schema/task/forkJoinTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { ForkIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { normalizeObject } from "../../../../schema/schemaUtils";
import { ForkTaskConfig } from "../../../../types/workflowDef";

const StaticForkConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(forkJoinTaskSchema, initialConfig));
    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    onUpdate({
      ...taskLevelParams,
      inputParameters: {}, // "The behavior of a FORK_JOIN task is not affected by inputParameters."
      forkTasks: (initialConfig as ForkTaskConfig).forkTasks || [],
    });
  }, [initialConfig, onUpdate, taskLevelParams]);

  const handleTaskLevelParamsChange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Static Fork Task"
      Icon={ForkIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Static Fork (FORK_JOIN) operation lets you run a specified list of
        tasks or sub workflows in parallel. The tasks to spawn must be
        statically specified in the Workflow Definition. Use a Dynamic Fork
        where the identity of forked tasks will not be known until runtime.
      </div>
      <AttributeTable
        schema={forkJoinTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />
    </PanelContainer>
  );
};

export default StaticForkConfigPanel;
