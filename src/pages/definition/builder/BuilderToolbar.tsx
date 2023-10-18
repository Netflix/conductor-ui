import { useContext, useMemo, useState } from "react";
import { Button, Text, Select, Pill } from "../../../components";
import { MenuItem, SelectChangeEvent, Toolbar, Tooltip } from "@mui/material";
import _ from "lodash";

import { DefEditorContext } from "../WorkflowDefinition";
import { NamesAndVersions } from "../../../types/namesAndVersions";
import { useWorkflowNamesAndVersions } from "../../../data/workflow";
import SaveWorkflowDialog from "../SaveWorkflowDialog";

export default function BuilderToolbar() {
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
  } = context!;

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
    reload(workflowName, versionStr ? parseInt(versionStr) : undefined, false);
  };

  const handleSaveCancel = () => {
    setSaveDialog(false);
  };

  const handleSaveSuccess = (name: string, version: number) => {
    setSaveDialog(false);
    reload(name, version, true);
    refetchNamesAndVersions();
  };

  return (
    <>
      <Toolbar>
        <Text style={{ fontWeight: "bold" }}>{workflowName || "NEW"}</Text>

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
            !isModified || hasUncommited
              ? "If changes were made in the JSON editor, they must be validated first. Likewise, changes made in the Task Configuration tool must be applied"
              : "Push definition to the Conductor service"
          }
        >
          <span>
            <Button
              color="primary"
              disabled={!isModified || hasUncommited}
              onClick={handleOpenSave}
            >
              Commit
            </Button>
          </span>
        </Tooltip>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
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
