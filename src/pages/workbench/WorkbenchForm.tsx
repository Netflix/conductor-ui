import { Text, Pill, Input } from "../../components";
import { Toolbar, IconButton, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import _ from "lodash";
import { useWorkflowDef } from "../../data/workflow";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SaveIcon from "@mui/icons-material/Save";
import { colors } from "../../theme/variables";
import { timestampRenderer } from "../../utils/helpers";
import * as Yup from "yup";
import { useCallback, useEffect, useState } from "react";
import { WorkflowNameInput } from "../../components";
import WorkflowVersionInput from "../../components/WorkflowVersionInput";
import JsonInput from "../../components/JsonInput";
import { useQueryState } from "react-router-use-location-state";

const useStyles = makeStyles({
  name: {
    width: "50%",
  },
  submitButton: {
    float: "right",
  },
  toolbar: {
    backgroundColor: colors.gray14,
  },
  workflowName: {
    fontWeight: "bold",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },
  fields: {
    width: "100%",
    padding: 30,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    overflowY: "auto",
    gap: 15,
  },
});

export default function WorkbenchForm({ selectedRun, saveRun, executeRun }) {
  const classes = useStyles();

  const createTime = selectedRun ? selectedRun.createTime : undefined;

  const [initialWorkflowName, setInitialWorkflowName] = useQueryState(
    "workflowName",
    "",
  );

  const [workflowName, setWorkflowName] = useState<string | undefined>();
  const [workflowVersion, setWorkflowVersion] = useState<string | undefined>();
  const [workflowInput, setWorkflowInput] = useState<string>("");
  const [correlationId, setCorrelationId] = useState<string>("");
  const [taskToDomain, setTaskToDomain] = useState<string>("");

  // Populate inputParameters
  const { refetch } = useWorkflowDef(workflowName, workflowVersion, {
    enabled: false,
  });

  const toRunPayload = useCallback(() => {
    return {
      name: workflowName,
      version: _.isEmpty(workflowVersion) ? undefined : workflowVersion,
      input: _.isEmpty(workflowInput) ? undefined : JSON.parse(workflowInput),
      correlationId: _.isEmpty(correlationId) ? undefined : correlationId,
      taskToDomain: _.isEmpty(taskToDomain)
        ? undefined
        : JSON.parse(taskToDomain),
    };
  }, [
    correlationId,
    taskToDomain,
    workflowInput,
    workflowName,
    workflowVersion,
  ]);

  const handleRun = useCallback(() => {
    const payload = toRunPayload();
    if (createTime) {
      console.log("Executing pre-existing run. Append workflowRecord");
      executeRun(createTime, payload);
    } else {
      console.log("Executing new run. Save first then execute");
      const newRun = saveRun(payload);
      executeRun(newRun.createTime, payload);
    }
  }, [createTime, executeRun, saveRun, toRunPayload]);

  const handleSave = useCallback(() => {
    const payload = toRunPayload();
    saveRun(payload);
  }, [saveRun, toRunPayload]);

  const handlePopulateInput = useCallback(() => {
    refetch().then((res) => console.log(res));
  }, [refetch]);

  useEffect(() => {
    console.log(selectedRun);
    if (selectedRun) {
      const { runPayload } = selectedRun;
      setWorkflowName(runPayload.name);
      setWorkflowVersion(runPayload.version);
      setWorkflowInput(
        runPayload.input ? JSON.stringify(runPayload.input, null, 2) : "",
      );
      setCorrelationId(runPayload.correlationId || "");
      setTaskToDomain(
        runPayload.taskToDomain
          ? JSON.stringify(runPayload.taskToDomain, null, 2)
          : "",
      );
    }
  }, [selectedRun]);

  useEffect(() => {
    if (!_.isEmpty(initialWorkflowName)) {
      setWorkflowName(initialWorkflowName);
      setInitialWorkflowName("");
    }
  }, [initialWorkflowName, setInitialWorkflowName]);

  return (
    <div className={classes.main}>
      <Toolbar className={classes.toolbar}>
        <Text className={classes.workflowName}>Workflow Workbench</Text>
        <Tooltip title="Execute Workflow">
          <IconButton onClick={handleRun} size="large">
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save Workflow Trigger">
          <div>
            <IconButton onClick={handleSave} size="large">
              <SaveIcon />
            </IconButton>
          </div>
        </Tooltip>

        <Tooltip title="Populate Input Parameters">
          <div>
            <IconButton
              disabled={!workflowName}
              onClick={handlePopulateInput}
              size="large"
            >
              <PlaylistAddIcon />
            </IconButton>
          </div>
        </Tooltip>

        {createTime && <Text>Created: {timestampRenderer(createTime)}</Text>}
      </Toolbar>

      <div className={classes.fields}>
        <WorkflowNameInput
          fullWidth
          multiple={false}
          label="Workflow Name"
          value={workflowName}
          onChange={(e, v) => setWorkflowName(v as string)}
        />

        <WorkflowVersionInput
          fullWidth
          label="Workflow version"
          workflowName={workflowName}
          value={workflowVersion}
          onChange={(e, v) => setWorkflowVersion(v as string)}
        />

        <JsonInput
          height={200}
          label="Input (JSON)"
          value={workflowInput}
          onChange={(v) => setWorkflowInput(v as string)}
        />

        <Input
          fullWidth
          label="Correlation ID"
          name="correlationId"
          value={correlationId}
          onChange={(v) => setCorrelationId(v)}
        />

        <JsonInput
          height={200}
          label="Task to Domain (JSON)"
          value={taskToDomain}
          onChange={(v) => setTaskToDomain(v!)}
        />
      </div>
    </div>
  );
}

function runPayloadToFormData(runPayload) {
  return {
    workflowName: _.get(runPayload, "name", undefined),
    workflowVersion: _.get(runPayload, "version", undefined),
    workflowInput: _.has(runPayload, "input")
      ? JSON.stringify(runPayload.input, null, 2)
      : "",
    correlationId: _.get(runPayload, "correlationId", ""),
    taskToDomain: _.has(runPayload, "taskToDomain")
      ? JSON.stringify(runPayload.taskToDomain, null, 2)
      : "",
  };
}
