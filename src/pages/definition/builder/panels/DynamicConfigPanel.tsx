import { useCallback, useEffect, useState } from "react";
import { dynamicTaskSchema } from "../../../../schema/task/dynamicTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { DynamicIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import _ from "lodash";
import JsonInput from "../../../../components/JsonInput";

const DynamicConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [inputParameters, setInputParameters] = useState<string>("{}");

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(dynamicTaskSchema, initialConfig));
    setInputParameters(loadInputParameters(initialConfig));

    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const retval = {
      ...taskLevelParams,
      inputParameters: parseWithDefault(inputParameters),
    };

    onUpdate(retval);
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
      heading="Dynamic Task"
      Icon={DynamicIcon}
    >
      <div style={{ marginBottom: 15 }}>
        Dynamic Tasks are useful in situations when need to run a task of which
        the task type is determined at runtime instead of during the
        configuration.
      </div>

      <AttributeTable
        schema={dynamicTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
        hideFields={["type"]}
        style={{ marginBottom: 30 }}
      />

      <JsonInput
        label="inputParameters"
        value={inputParameters}
        onChange={handleInputParametersChange}
      />
    </PanelContainer>
  );
};

export default DynamicConfigPanel;
