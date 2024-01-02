import { useCallback, useEffect, useState } from "react";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { DoWhileIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { humanTaskSchema } from "../../../../schema/task/humanTask";
import {
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import JsonInput from "../../../../components/JsonInput";
import { DoWhileTaskConfig } from "../../../../types/workflowDef";

const DoWhileConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [loopCondition, setLoopCondition] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<string>("{}");

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(humanTaskSchema, initialConfig));
    setInputParameters(loadInputParameters(initialConfig));
    setLoopCondition((initialConfig as DoWhileTaskConfig).loopCondition || "");

    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const loopOver = (initialConfig as DoWhileTaskConfig).loopOver || [];
    onUpdate({
      ...taskLevelParams,
      loopCondition,
      inputParameters: parseWithDefault(inputParameters),
      loopOver,
    });
  }, [
    initialConfig,
    inputParameters,
    loopCondition,
    onUpdate,
    taskLevelParams,
  ]);

  const handleTaskLevelParamsChange = useCallback(
    (obj) => {
      setTaskLevelParams(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleLoopConditionChange = useCallback(
    (obj) => {
      setLoopCondition(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputParametersChange = useCallback(
    (obj) => {
      setLoopCondition(obj);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Do-While Task"
      Icon={DoWhileIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The DO_WHILE task sequentially executes a list of tasks as long as a
        given condition is true. The list of tasks is executed first, before the
        condition is checked (the first iteration will always execute).
      </div>

      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={humanTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />

      <JsonInput
        style={{ marginBottom: 30 }}
        label="Loop Condition"
        language="javascript"
        value={loopCondition}
        onChange={handleLoopConditionChange}
      />

      <JsonInput
        style={{ marginBottom: 30 }}
        label="inputParameters"
        language="json"
        value={inputParameters}
        onChange={handleInputParametersChange}
      />
    </PanelContainer>
  );
};

export default DoWhileConfigPanel;
