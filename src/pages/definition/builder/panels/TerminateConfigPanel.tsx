import { useCallback, useEffect, useState } from "react";
import JsonInput from "../../../../components/JsonInput";
import { terminateTaskSchema } from "../../../../schema/task/terminateTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { TerminateIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { normalizeObject } from "../../../../schema/schemaUtils";

const TerminateConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [workflowOutput, setWorkflowOutput] = useState<string>("");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(terminateTaskSchema, initialConfig));

    if (initialConfig.inputParameters?.workflowOutput) {
      setWorkflowOutput(
        JSON.stringify(initialConfig.inputParameters.workflowOutput, null, 2),
      );
    }

    onChanged(false);
  }, [initialConfig, onChanged, workflowOutput]);

  const handleApply = useCallback(() => {
    const newTaskConfig = { ...taskLevelParams };
    if (workflowOutput !== "") {
      newTaskConfig.inputParameters = {
        workflowOutput: JSON.parse(workflowOutput),
      };
    }

    onUpdate(newTaskConfig);
  }, [onUpdate, taskLevelParams, workflowOutput]);

  const handleTaskLevelParamsChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleWorkflowOutputChange = useCallback(
    (v) => {
      setWorkflowOutput(v!);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Terminate Task"
      Icon={TerminateIcon}
    >
      <div>
        The Terminate task will exit the workflow with a given status and set
        the workflow's output with the provided value. It is often used in
        conjunction with a SWITCH task to conditionally terminate a workflow.
      </div>

      <AttributeTable
        schema={terminateTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
        hideFields={["type"]}
      />

      <JsonInput
        label="workflowOutput"
        value={workflowOutput}
        style={{ marginBottom: "15px" }}
        onChange={handleWorkflowOutputChange}
      />
    </PanelContainer>
  );
};

export default TerminateConfigPanel;
