import { useRef, useState, useMemo } from "react";
import {
  Dialog,
  Toolbar,
  FormControlLabel,
  Checkbox,
  Snackbar,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { Text, Button, LinearProgress, Pill } from "../../components";
import { DiffEditor } from "@monaco-editor/react";
import { makeStyles } from "@mui/styles";
import {
  useSaveWorkflow,
  useWorkflowNamesAndVersions,
} from "../../data/workflow";
import _ from "lodash";
import { useEffect } from "react";
import { WorkflowDef } from "../../types/workflowDef";
import produce from "immer";

const useStyles = makeStyles({
  rightButtons: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-end",
    gap: 8,
  },
  toolbar: {
    paddingLeft: 20,
  },
});
//const WORKFLOW_SAVED_SUCCESSFULLY = "Workflow saved successfully.";
const WORKFLOW_SAVE_FAILED = "Failed to save the workflow definition.";

type SaveWorkflowDialogProps = {
  onSuccess: (name: string, version: number) => void;
  onCancel: () => void;
  modified: WorkflowDef;
  original: WorkflowDef;
  open: boolean;
};

export default function SaveWorkflowDialog({
  onSuccess,
  onCancel,
  modified,
  original,
  open,
}: SaveWorkflowDialogProps) {
  const classes = useStyles();
  const diffMonacoRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [useAutoVersion, setUseAutoVersion] = useState(true);
  const { data: namesAndVersions } = useWorkflowNamesAndVersions();

  const isNew = original.name !== modified.name;
  const isClash =
    isNew && namesAndVersions && !!namesAndVersions[modified.name]; // New workflow cannot use existing name to prevent accidental overwrite.

  // Increment version if needed.
  const upVersioned = useMemo(() => {
    if (useAutoVersion && namesAndVersions) {
      const latestVersion = _.get(
        _.last(namesAndVersions[modified.name]),
        "version",
        0,
      );

      return produce(modified, (draftState) => {
        if (_.isNumber(latestVersion)) {
          draftState.version = latestVersion + 1;
        } else {
          draftState.version = 1;
        }
      });
    } else {
      return modified;
    }
  }, [modified, useAutoVersion, namesAndVersions]);

  useEffect(() => {
    if (isClash) {
      setErrorMsg(
        "Cannot save workflow definition. Workflow name already in use.",
      );
    } else {
      setErrorMsg(undefined);
    }
  }, [isClash]);

  const { isLoading, mutate: saveWorkflow } = useSaveWorkflow({
    onSuccess: (data) => {
      console.log("onsuccess", data);
      onSuccess(upVersioned.name, upVersioned.version);
    },
    onError: (err) => {
      console.log("onerror", err);
      let errStr = _.isString(err.body)
        ? err.body
        : JSON.stringify(err.body, null, 2);
      setErrorMsg(`${WORKFLOW_SAVE_FAILED}: ${errStr}`);
    },
  });

  const originalText = useMemo(
    () => JSON.stringify(original, null, 2),
    [original],
  );
  const modifiedText = useMemo(
    () => JSON.stringify(upVersioned, null, 2),
    [upVersioned],
  );

  const handleSave = () => {
    saveWorkflow({ body: upVersioned, isNew });
  };

  const diffEditorDidMount = (editor) => {
    diffMonacoRef.current = editor;
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => onCancel()}
      TransitionProps={{
        onEnter: () => setUseAutoVersion(true),
      }}
    >
      <Snackbar
        open={!!errorMsg}
        onClose={() => setErrorMsg(undefined)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transitionDuration={{ exit: 0 }}
      >
        <Alert onClose={() => setErrorMsg(undefined)} severity="error">
          {errorMsg}
        </Alert>
      </Snackbar>

      {isLoading && <LinearProgress />}

      <Toolbar className={classes.toolbar}>
        <Text>
          Saving <span style={{ fontWeight: "bold" }}>{upVersioned.name}</span>
        </Text>

        {isNew && <Pill label="New" color="yellow" />}

        <div className={classes.rightButtons}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useAutoVersion}
                onChange={(e) => setUseAutoVersion(e.target.checked)}
                disabled={isClash}
              />
            }
            label="Automatically set version"
          />
          <Button onClick={handleSave} disabled={isClash}>
            Save
          </Button>
          <Button onClick={() => onCancel()} variant="secondary">
            Cancel
          </Button>
        </div>
      </Toolbar>

      <DiffEditor
        height={"100%"}
        width={"100%"}
        theme="vs-light"
        language="json"
        original={originalText}
        modified={modifiedText}
        onMount={diffEditorDidMount}
        options={{
          selectOnLineNumbers: true,
          readOnly: true,
          minimap: {
            enabled: false,
          },
        }}
      />
    </Dialog>
  );
}
