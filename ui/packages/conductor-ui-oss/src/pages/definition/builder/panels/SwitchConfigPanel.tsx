import { useCallback, useEffect, useState } from "react";
import JsonInput from "../../../../components/JsonInput";
import DecisionCasesEditor from "./DecisionCasesEditor";
import { SwitchTaskSchema } from "../../../../schema/task/switchTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { SwitchIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import { SwitchTaskConfig } from "../../../../types/workflowDef";

const SwitchConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [expression, setExpression] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<string>("");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [decisionCases, setDecisionCases] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(SwitchTaskSchema, initialConfig));
    setInputParameters(loadInputParameters(initialConfig));

    const config = initialConfig as SwitchTaskConfig;

    if (config.decisionCases) {
      setDecisionCases(config.decisionCases);
    }

    if (config.expression) {
      setExpression(config.expression);
    }

    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const defaultCase = (initialConfig as SwitchTaskConfig).defaultCase || [];

    const newTaskConfig = {
      ...taskLevelParams,
      expression,
      decisionCases,
      defaultCase,
      inputParameters: parseWithDefault(inputParameters),
    };

    onUpdate(newTaskConfig);
  }, [
    initialConfig,
    taskLevelParams,
    expression,
    decisionCases,
    inputParameters,
    onUpdate,
  ]);

  const handleTaskLevelChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleDecisionCasesChange = useCallback(
    (updatedJson) => {
      setDecisionCases(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputParametersChange = useCallback(
    (val) => {
      setInputParameters(val);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Switch Task"
      Icon={SwitchIcon}
    >
      <div style={{ marginBottom: 15 }}>
        <p>
          The Switch task is similar to the <code>switch..case</code> statement
          in a programming language. <code>expression</code> is evaluated and
          the appropriate branch in <code>decisionCases</code> is executed based
          on the output of the expression.
        </p>
        <p>
          Two options are supported for <code>evaluatorType</code>:{" "}
          <code>javascript</code> and <code>value-param</code>.
        </p>
        <p>
          <b>Note</b>: With no tasks added to the "default" case, the Switch
          task will fall through when none of the cases match, allowing the
          workflow to continue. If the expected behavior is for the workflow to
          fail in such an event, please add a TERMINATE task to the default
          case.
        </p>
      </div>
      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={SwitchTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelChange}
      />

      <DecisionCasesEditor
        style={{ marginBottom: 30 }}
        initialDecisionCases={decisionCases}
        onChange={handleDecisionCasesChange}
      />

      <JsonInput
        style={{ marginBottom: 30 }}
        label="expression"
        value={expression}
        onChange={(v) => {
          setExpression(v!);
          onChanged(true);
        }}
        language="javascript"
      />
      <JsonInput
        label="inputParameters"
        value={inputParameters}
        onChange={handleInputParametersChange}
      />
    </PanelContainer>
  );
};
export default SwitchConfigPanel;
