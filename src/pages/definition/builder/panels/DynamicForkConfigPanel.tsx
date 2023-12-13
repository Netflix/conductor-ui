import { useCallback, useEffect, useState } from "react";
import _, { initial } from "lodash";
import JsonInput from "../../../../components/JsonInput";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { DynamicForkIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { forkJoinDynamicTaskSchema } from "../../../../schema/task/forkJoinDynamicTask";
import {
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";

const DynamicForkConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [inputParameters, setInputParameters] = useState<string>("{}");

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(
      normalizeObject(forkJoinDynamicTaskSchema, initialConfig),
    );
    setInputParameters(loadInputParameters(initialConfig));
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const retval = {
      ...taskLevelParams,
      inputParameters: parseWithDefault(inputParameters),
    };

    onUpdate(retval);
  }, [onUpdate, inputParameters, taskLevelParams]);

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
      heading="Dynamic Fork Task"
      Icon={DynamicForkIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Dynamic Fork (FORK_JOIN_DYNAMIC) operation lets you execute a list
        of tasks or sub-workflows in parallel. This list will be determined at
        run-time and be of variable length.
      </div>

      <AttributeTable
        schema={forkJoinDynamicTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
        style={{ marginBottom: 30 }}
      />

      <JsonInput
        label="inputParameters"
        value={inputParameters}
        onChange={handleInputParametersChange}
        height={200}
      />
    </PanelContainer>
  );
};

export default DynamicForkConfigPanel;
