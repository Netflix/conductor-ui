import { useCallback, useEffect, useState } from "react";
import AttributeTable from "../taskconfigurator/AttributeTable";
import JsonInput from "../../../../components/JsonInput";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { StartWorkflowIcon } from "../../../../components/diagram/icons/taskIcons";
import {
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import { startWorkflowSchema } from "../../../../schema/task/startWorkflowTask";
import _ from "lodash";

const StartWorkflowConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [startWorkflow, setStartWorkflow] = useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(startWorkflowSchema, initialConfig));

    const swf = _.get(initialConfig, "inputParameters.startWorkflow", {});
    setStartWorkflow(JSON.stringify(swf, null, 2));

    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const newTaskConfig = {
      ...taskLevelParams,
      inputParameters: {
        startWorkflow: parseWithDefault(startWorkflow),
      },
    };

    onUpdate(newTaskConfig);
  }, [onUpdate, startWorkflow, taskLevelParams]);

  const handleTaskLevelParamsChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleStartWorkflowChange = useCallback(
    (v) => {
      setStartWorkflow(v);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Start Workflow Task"
      Icon={StartWorkflowIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Start Workflow task starts another workflow. Unlike SUB_WORKFLOW,
        START_WORKFLOW does not create a relationship between starter and the
        started workflow. It also does not wait for the started workflow to
        complete. Workflow execution will continue once the requested workflow
        is started successfully.
      </div>
      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={startWorkflowSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />

      <JsonInput
        label="startWorkflow"
        value={startWorkflow}
        onChange={handleStartWorkflowChange}
        language="json"
      />
    </PanelContainer>
  );
};

export default StartWorkflowConfigPanel;
