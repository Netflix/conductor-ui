import { useCallback, useEffect, useState } from "react";
import JsonInput from "../../../../components/JsonInput";
import {
  terminateInputParametersSchema,
  terminateTaskSchema,
} from "../../../../schema/task/terminateTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { TerminateIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { allVisible, normalizeObject } from "../../../../schema/schemaUtils";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

const TerminateConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const classes = useStyles();

  const [workflowOutput, setWorkflowOutput] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<any>({});
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(terminateTaskSchema, initialConfig));

    setInputParameters(
      normalizeObject(
        terminateInputParametersSchema,
        initialConfig.inputParameters,
      ),
    );

    if (initialConfig.inputParameters?.workflowOutput) {
      setWorkflowOutput(
        JSON.stringify(initialConfig.inputParameters.workflowOutput, null, 2),
      );
    }

    onChanged(false);
  }, [initialConfig, onChanged, workflowOutput]);

  const handleApply = useCallback(() => {
    const newTaskConfig = {
      ...taskLevelParams,
      inputParameters: inputParameters,
    };

    if (workflowOutput.trim() !== "") {
      newTaskConfig.inputParameters.workflowOutput = JSON.parse(workflowOutput);
    }

    onUpdate(newTaskConfig);
  }, [inputParameters, onUpdate, taskLevelParams, workflowOutput]);

  const handleTaskLevelParamsChange = useCallback(
    (updatedJson) => {
      setTaskLevelParams(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  const handleWorkflowOutputChange = useCallback(
    (v) => {
      setWorkflowOutput(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleTerminateInputParametersChange = useCallback(
    (v) => {
      setInputParameters(v);
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
      <div style={{ marginBottom: 15 }}>
        The Terminate task will exit the workflow with a given status and set
        the workflow's output with the provided value. It is often used in
        conjunction with a SWITCH task to conditionally terminate a workflow.
      </div>

      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={terminateTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />

      <div style={{ marginBottom: 30 }}>
        <div className={classes.subHeader} style={{ marginBottom: 10 }}>
          Terminate Parameters
        </div>
        <AttributeTable
          schema={allVisible(terminateInputParametersSchema)}
          config={inputParameters}
          onChange={handleTerminateInputParametersChange}
        />
      </div>

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
