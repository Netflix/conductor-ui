import { useContext, useMemo, useState } from "react";
import {
  Button,
  Text,
  Select,
  Pill,
  usePushHistory,
} from "../../../components";
import { MenuItem, SelectChangeEvent, Toolbar, Tooltip } from "@mui/material";
import _ from "lodash";

import { DefEditorContext } from "../WorkflowDefinition";
import { NamesAndVersions } from "../../../types/namesAndVersions";
import { useWorkflowNamesAndVersions } from "../../../data/workflow";
import ResetConfirmationDialog from "../ResetConfirmationDialog";
import SaveWorkflowDialog from "../SaveWorkflowDialog";

export default function BuilderToolbar() {
  const [saveDialog, setSaveDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState<number | undefined | false>(
    false,
  );
  const {
    data: namesAndVersions,
    refetch: refetchNamesAndVersions,
  }: { data?: NamesAndVersions; refetch: Function } =
    useWorkflowNamesAndVersions();
  const navigate = usePushHistory();
  const context = useContext(DefEditorContext);
  const {
    workflowName,
    workflowVersion,
    original,
    staging,
    setStaging,
    refetchWorkflow,
  } = context!;

  const versions = useMemo(
    () => _.get(namesAndVersions, workflowName!, []),
    [namesAndVersions, workflowName],
  );

  const isModified = original !== staging;

  // Saving
  const handleOpenSave = () => {
    setSaveDialog(true);
  };

  // Version Change or Reset
  const handleResetVersion = (version: string | undefined) => {
    const versionNum = version ? parseInt(version) : undefined;
    if (isModified) {
      setResetDialog(versionNum);
    } else {
      changeVersionOrReset(versionNum);
    }
  };

  const changeVersionOrReset = (version: number | undefined) => {
    if (version === workflowVersion) {
      // Reset to fetched version
      console.log("here same");
      setStaging(original);
    } else if (version === undefined) {
      navigate(`/workflowDef/${workflowName}`);
    } else {
      navigate(`/workflowDef/${workflowName}/${version}`);
    }

    setResetDialog(false);
  };

  const handleSaveCancel = () => {
    setSaveDialog(false);
  };

  const handleSaveSuccess = (name: string, version: number) => {
    setSaveDialog(false);
    refetchNamesAndVersions();

    if (name === workflowName && version === workflowVersion) {
      refetchWorkflow();
    } else {
      navigate(`/workflowDef/${name}/${version}`);
    }
  };

  return (
    <>
      <Toolbar>
        <Text style={{ fontWeight: "bold" }}>{workflowName || "NEW"}</Text>

        <Select
          fullWidth
          label=""
          value={!workflowVersion || _.isEmpty(versions) ? "" : workflowVersion}
          displayEmpty
          renderValue={(v: string) =>
            v === "" ? "Latest Version" : `Version ${v}`
          }
          onChange={(evt: SelectChangeEvent) =>
            handleResetVersion(evt.target.value)
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
            !isModified
              ? "If changes were made in the JSON editor, they must be validated first. Likewise, changes made in the Task Configuration tool must be applied"
              : "Push definition to the Conductor service"
          }
        >
          <span>
            <Button
              color="error"
              disabled={!isModified}
              onClick={handleOpenSave}
            >
              Commit
            </Button>
          </span>
        </Tooltip>
        <Button
          disabled={!isModified}
          onClick={() => handleResetVersion(workflowVersion?.toString())}
          variant="secondary"
        >
          Reset
        </Button>
      </Toolbar>

      <ResetConfirmationDialog
        version={resetDialog}
        onConfirm={changeVersionOrReset}
        onClose={() => setResetDialog(false)}
      />

      <SaveWorkflowDialog
        open={saveDialog}
        original={original}
        modified={staging}
        onCancel={handleSaveCancel}
        onSuccess={handleSaveSuccess}
      />
    </>
  );
}
