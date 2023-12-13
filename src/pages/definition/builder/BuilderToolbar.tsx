import { useCallback, useContext, useMemo, useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Pill,
  SplitButton,
  usePushHistory,
  NavLink,
} from "../../../components";
import { MenuItem, SelectChangeEvent, Toolbar, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import _ from "lodash";

import { DefEditorContext, newWorkflow } from "../WorkflowDefinition";
import { NamesAndVersions } from "../../../types/namesAndVersions";
import { useWorkflowNamesAndVersions } from "../../../data/workflow";
import SaveWorkflowDialog from "../SaveWorkflowDialog";

import SIMPLE_TEMPLATE from "./templates/simpleTemplate.json";
import COMPLEX_TEMPLATE from "./templates/complexTemplate.json";
import WorkflowDAG from "../../../data/dag/WorkflowDAG";

const useStyles = makeStyles({
  button: {
    flexShrink: 0,
  },
});

export default function BuilderToolbar() {
  const classes = useStyles();
  const [saveDialog, setSaveDialog] = useState(false);

  const {
    data: namesAndVersions,
    refetch: refetchNamesAndVersions,
  }: { data?: NamesAndVersions; refetch: Function } =
    useWorkflowNamesAndVersions();
  const context = useContext(DefEditorContext);
  const {
    workflowName,
    workflowVersion,
    original,
    dag,
    isModified,
    reload,
    changes,
    setDag,
    setSelectedTask,
    setChanges,
    setOriginal,
    setModified,
  } = context!;
  const navigate = usePushHistory();
  const [localWorkflowName, setLocalWorkflowName] = useState<string>();

  const versions = useMemo(
    () => _.get(namesAndVersions, workflowName!, []),
    [namesAndVersions, workflowName],
  );

  const modified = useMemo(() => dag.toWorkflowDef(), [dag]);

  const hasUncommited = Object.entries(changes).reduce(
    (prev, [key, val]) => prev || !!val,
    false,
  );

  // Saving
  const handleOpenSave = () => {
    setSaveDialog(true);
  };

  // Version Change or Reset
  const handleReset = () => {
    reload(workflowName, workflowVersion, false);
  };

  const handleChangeVersion = (versionStr: string) => {
    reload(workflowName, versionStr ? versionStr : undefined, false);
  };

  const handleSaveCancel = () => {
    setSaveDialog(false);
  };

  const handleSaveSuccess = (name: string, version: string) => {
    setSaveDialog(false);
    reload(name, version, true);
    refetchNamesAndVersions();
  };

  const handleNew = useCallback(
    (template) => {
      if (isModified || !_.isEmpty(changes)) {
        const confirmed = window.confirm(
          "Changes not yet applied in the Task Config or JSON editor, or staged changes that have not been saved will be lost.",
        );

        if (!confirmed) return;
      }

      setSelectedTask(null, "NewButton");
      setChanges({});
      setModified(true);

      if (workflowName) {
        navigate("/workflowDef");
      }
      setOriginal(undefined);
      setDag("NewButton", WorkflowDAG.fromWorkflowDef(newWorkflow(template)));
    },
    [
      isModified,
      changes,
      setSelectedTask,
      setChanges,
      setModified,
      workflowName,
      setOriginal,
      setDag,
      navigate,
    ],
  );

  useEffect(() => setLocalWorkflowName(dag.toWorkflowDef().name), [dag]);

  const handleChangeWorkflowName = useCallback(
    (name) => {
      const newDef = { ...dag.toWorkflowDef(), name: name };
      const newDag = WorkflowDAG.fromWorkflowDef(newDef);
      setDag("BuilderToolbar", newDag);
    },
    [dag, setDag],
  );

  const handleChangeLocalWorkflowName = useCallback((name) => {
    setLocalWorkflowName(name);
  }, []);

  return (
    <>
      <Toolbar>
        <div style={{ fontWeight: "bold", flexShrink: 0 }}>Workflow Name</div>
        <Input
          fullWidth
          style={{ width: 500, flexShrink: 0 }}
          value={localWorkflowName}
          onBlur={handleChangeWorkflowName}
          onChange={handleChangeLocalWorkflowName}
        />

        <Select
          fullWidth
          label=""
          value={
            !workflowVersion || _.isEmpty(versions)
              ? ""
              : String(workflowVersion)
          }
          renderValue={(v: string) =>
            v === "" ? "Latest Version" : `Version ${v}`
          }
          onChange={(evt: SelectChangeEvent) =>
            handleChangeVersion(evt.target.value)
          }
        >
          <MenuItem value="">Latest Version</MenuItem>
          {versions!.map((row) => (
            <MenuItem value={row.version} key={row.version}>
              Version {row.version}
            </MenuItem>
          ))}
        </Select>

        {isModified ? (
          <Pill color="yellow" label="Changes Staged" />
        ) : (
          <Pill label="No Changes Staged" />
        )}

        <Tooltip
          disableFocusListener
          title={
            !workflowName &&
            "Workflow must be deployed before it can be tested in the Workbench."
          }
        >
          <span>
            <Button
              variant="secondary"
              classes={{
                root: classes.button,
              }}
              disabled={!workflowName}
              component={NavLink}
              newTab
              path={`/workbench?workflowName=${workflowName}`}
            >
              Workbench
            </Button>
          </span>
        </Tooltip>

        <Button onClick={handleReset} variant="secondary" disabled={!original}>
          Reset
        </Button>

        <SplitButton
          options={[
            {
              label: "Load complex sample",
              handler: () => handleNew(COMPLEX_TEMPLATE),
            },
          ]}
          onPrimaryClick={() => handleNew(SIMPLE_TEMPLATE)}
        >
          New
        </SplitButton>

        <Tooltip
          disableFocusListener
          title={
            !isModified || hasUncommited
              ? "If changes were made in the JSON editor, they must be validated first. Likewise, changes made in the Task Configuration tool must be applied"
              : "Push definition to the Conductor service"
          }
        >
          <span>
            <Button
              color="error"
              disabled={!isModified || hasUncommited}
              onClick={handleOpenSave}
            >
              Deploy
            </Button>
          </span>
        </Tooltip>
      </Toolbar>

      <SaveWorkflowDialog
        open={saveDialog}
        original={original}
        modified={modified}
        onCancel={handleSaveCancel}
        onSuccess={handleSaveSuccess}
      />
    </>
  );
}
