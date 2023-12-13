import { useCallback, useEffect, useState } from "react";
import { simpleTaskSchema } from "../../../../schema/task/simpleTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { SimpleIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import JsonInput from "../../../../components/JsonInput";

const SimpleConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");

  const [inputExpression, setInputExpression] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<string>("{}");

  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  console.log(parameterOrExpression);
  useEffect(() => {
    setParameterOrExpression(
      initialConfig.inputExpression ? "expression" : "parameter",
    );
    setTaskLevelParams(normalizeObject(simpleTaskSchema, initialConfig));

    const inputExpression = initialConfig.inputExpression?.expression;
    setInputExpression(inputExpression || "");

    setInputParameters(loadInputParameters(initialConfig));

    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const retval = { ...taskLevelParams };

    if (parameterOrExpression === "parameter") {
      retval.inputParameters = parseWithDefault(inputParameters);
    } else {
      retval.inputExpression = {
        type: "JSON_PATH",
        expression: inputExpression,
      };
    }

    onUpdate(retval);
  }, [
    inputExpression,
    inputParameters,
    onUpdate,
    parameterOrExpression,
    taskLevelParams,
  ]);

  const handleTaskLevelParamsChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleParameterOrExpressionChange = useCallback(
    (e, v) => {
      setParameterOrExpression(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputParametersChange = useCallback(
    (obj) => {
      setInputParameters(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputExpressionChange = useCallback(
    (exp) => {
      setInputExpression(exp);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Simple Task"
      Icon={SimpleIcon}
      parameterOrExpression={parameterOrExpression}
      onParameterOrExpressionChange={handleParameterOrExpressionChange}
    >
      <div style={{ marginBottom: 15 }}>
        A Simple Task distributes work to a cluster of registered and deployed
        workers. The worker type is specified in the "name" field.
      </div>
      <AttributeTable
        schema={simpleTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
        style={{ marginBottom: 30 }}
      />

      {parameterOrExpression === "parameter" && (
        <JsonInput
          key="parameter"
          label="inputParameters"
          value={inputParameters}
          onChange={handleInputParametersChange}
        />
      )}
      {parameterOrExpression === "expression" && (
        <JsonInput
          key="expression"
          label="inputExpression"
          language="plaintext"
          value={inputExpression}
          onChange={handleInputExpressionChange}
        />
      )}
    </PanelContainer>
  );
};

export default SimpleConfigPanel;
