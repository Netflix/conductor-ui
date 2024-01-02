/* eslint-disable no-template-curly-in-string */
import { useCallback, useEffect, useState } from "react";
import JsonInput from "../../../../components/JsonInput";
import PanelContainer from "./BasePanel";
import { SetVariableIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import { setVariableSchema } from "../../../../schema/task/setVariableTask";

export default function SetVariableConfigPanel({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}) {
  const [inputParameters, setInputParameters] = useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(setVariableSchema, initialConfig));
    setInputParameters(loadInputParameters(initialConfig));
    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const newTaskConfig = { ...taskLevelParams };
    newTaskConfig.inputParameters = parseWithDefault(inputParameters);
    onUpdate(newTaskConfig);
  }, [inputParameters, onUpdate, taskLevelParams]);

  const handleTaskLevelParamsChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputParametersChange = useCallback(
    (v) => {
      setInputParameters(v!);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Set Variable Task"
      Icon={SetVariableIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Set Variable task allows users to create global workflow variables,
        and update them with new values. Variables can be initialized in the
        workflow definition as well as during the workflow run. Once a variable
        is initialized it can be read using the expression{" "}
        {"${workflow.variables.NAME}"} by any other task.
      </div>
      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={setVariableSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />

      <JsonInput
        label="Global Variables"
        value={inputParameters}
        onChange={handleInputParametersChange}
        height={200}
      />
    </PanelContainer>
  );
}
