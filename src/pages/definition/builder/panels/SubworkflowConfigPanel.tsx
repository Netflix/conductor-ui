import { useCallback, useEffect, useState } from "react";
import JsonInput from "../../../../components/JsonInput";
import {
  subWorkflowParamSchema,
  subWorkflowTaskSchema,
} from "../../../../schema/task/subWorkflowTask";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { SubWorkflowIcon } from "../../../../components/diagram/icons/taskIcons";
import {
  allVisible,
  loadInputParameters,
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";
import { SubworkflowTaskConfig } from "../../../../types/workflowDef";
import AttributeTable from "../taskconfigurator/AttributeTable";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

const SubWorkflowTaskConfigurator = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const classes = useStyles();

  const [inputParameters, setInputParameters] = useState<string>("");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});
  const [taskToDomain, setTaskToDomain] = useState<string>("");
  const [workflowDefinition, setWorkflowDefinition] = useState<string>("");
  const [subWorkflowParam, setSubWorkflowParam] = useState<any>({});

  useEffect(() => {
    const config = initialConfig as SubworkflowTaskConfig;

    setTaskLevelParams(normalizeObject(subWorkflowTaskSchema, config));
    setInputParameters(loadInputParameters(config));
    setSubWorkflowParam(
      normalizeObject(subWorkflowParamSchema, config.subWorkflowParam || {}),
    );

    if (config.subWorkflowParam?.taskToDomain) {
      setTaskToDomain(
        JSON.stringify(config.subWorkflowParam.taskToDomain, null, 2),
      );
    }

    if (config.subWorkflowParam?.workflowDefinition) {
      setWorkflowDefinition(
        JSON.stringify(config.subWorkflowParam.workflowDefinition, null, 2),
      );
    }

    // Reset changed
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleApply = useCallback(() => {
    const newTaskConfig = {
      ...taskLevelParams,
      subWorkflowParam: subWorkflowParam,
      inputParameters: parseWithDefault(inputParameters),
    };

    if (taskToDomain !== "") {
      newTaskConfig.subWorkflowParam.taskToDomain = JSON.parse(taskToDomain);
    }

    if (workflowDefinition !== "") {
      newTaskConfig.subWorkflowParam.workflowDefinition =
        JSON.parse(workflowDefinition);
    }

    onUpdate(newTaskConfig);
  }, [
    taskLevelParams,
    subWorkflowParam,
    inputParameters,
    taskToDomain,
    workflowDefinition,
    onUpdate,
  ]);

  const handleTaskToDomainChange = useCallback(
    (v) => {
      setTaskToDomain(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleWorkflowDefinitionChange = useCallback(
    (v) => {
      setWorkflowDefinition(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputParametersChange = useCallback(
    (v) => {
      setInputParameters(v);
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

  const handleSubworkflowParamChange = useCallback(
    (updatedJson) => {
      setSubWorkflowParam(updatedJson);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Sub Workflow Task"
      Icon={SubWorkflowIcon}
    >
      <div style={{ marginBottom: 15 }}>
        Sub Workflow task allows for nesting a workflow within another workflow.
        Nested workflows contain a reference to their parent.
      </div>
      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={subWorkflowTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
      />

      <div className={classes.subHeader} style={{ marginBottom: 10 }}>
        subWorkflowParam
      </div>
      <AttributeTable
        style={{ marginBottom: 30 }}
        schema={allVisible(subWorkflowParamSchema)}
        config={subWorkflowParam}
        onChange={handleSubworkflowParamChange}
      />

      <JsonInput
        style={{ marginBottom: 30 }}
        label="taskToDomain"
        value={taskToDomain}
        onChange={handleTaskToDomainChange}
      />

      <JsonInput
        style={{ marginBottom: 30 }}
        label="workflowDefinition"
        value={workflowDefinition}
        onChange={handleWorkflowDefinitionChange}
      />

      <JsonInput
        style={{ marginBottom: 30 }}
        label="inputParameters"
        value={inputParameters}
        onChange={handleInputParametersChange}
      />
    </PanelContainer>
  );
};

export default SubWorkflowTaskConfigurator;
