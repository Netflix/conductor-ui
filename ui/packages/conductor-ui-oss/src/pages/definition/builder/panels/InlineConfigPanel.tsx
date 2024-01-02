import { useCallback, useEffect, useState } from "react";
import JsonInput from "../../../../components/JsonInput";
import { inlineTaskSchema } from "../../../../schema/task/inlineTask";
import PanelContainer from "./BasePanel";
import { InlineIcon } from "../../../../components/diagram/icons/taskIcons";
import {
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import _ from "lodash";
import AttributeTable from "../taskconfigurator/AttributeTable";

export default function InlineConfigPanel({
  tabId,
  onChanged,
  onUpdate,
  initialConfig,
}) {
  const [additionalInputParameters, setAdditionalInputParameters] =
    useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(inlineTaskSchema, initialConfig));

    const additionalParameters = initialConfig.inputParameters
      ? JSON.stringify(
          _.omit(initialConfig.inputParameters, [
            "evaluatorType",
            "expression",
          ]),
          null,
          2,
        )
      : "{}";
    setAdditionalInputParameters(additionalParameters);

    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const retval = {
      ...taskLevelParams,
      inputParameters: {
        expression: initialConfig.inputParameters?.expression || "",
        evaluatorType:
          initialConfig.inputParameters?.evaluatorType || "javascript",
        ...parseWithDefault(additionalInputParameters),
      },
    };

    onUpdate(retval);
  }, [taskLevelParams, initialConfig, additionalInputParameters, onUpdate]);

  const handleAdditionalInputParametersChange = useCallback(
    (v) => {
      setAdditionalInputParameters(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleTaskLevelParamsChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Inline Task"
      Icon={InlineIcon}
    >
      <div style={{ marginBottom: 15 }}>
        The Inline, or script task executes code at workflow runtime, using an
        evaluator. Two evaluator types are supported - Javascript, and a simple
        expression evaluator. Use The Script Editor tab to edit the task script.
      </div>

      <AttributeTable
        schema={inlineTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
        style={{ marginBottom: "30px" }}
      />

      <JsonInput
        label="inputParameters"
        value={additionalInputParameters}
        onChange={handleAdditionalInputParametersChange}
        height={200}
      />
    </PanelContainer>
  );
}
