import { useRef, useState, useMemo, useEffect, ReactNode } from "react";
import { Dialog, Toolbar, Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
import { Text, Button, LinearProgress, Pill } from "../../components";
import { DiffEditor } from "@monaco-editor/react";
import { makeStyles } from "@mui/styles";
import { useSaveTask, useTaskNames } from "../../data/task";
import _ from "lodash";

type ErrorMsg = {
  message: ReactNode;
  dismissible?: boolean;
};

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
const TASK_SAVE_FAILED = "Failed to save the task definition.";

export default function SaveTaskDialog({ onSuccess, onCancel, document }) {
  const classes = useStyles();
  const diffMonacoRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState<ErrorMsg>();
  const taskNames = useTaskNames();

  const modified = useMemo(() => {
    if (!taskNames || !document)
      return {
        obj: undefined,
        isNew: false,
        isClash: false,
        text: "",
      };

    const parsedModified = JSON.parse(document.modified);
    const modifiedName = parsedModified.name;
    const isNew = _.get(document, "originalObj.name") !== modifiedName;

    return {
      text: document.modified,
      obj: parsedModified,
      isNew: isNew,
      isClash: isNew && taskNames.includes(modifiedName),
    };
  }, [document, taskNames]);

  const { isLoading, mutate: saveTask } = useSaveTask({
    onSuccess: (data) => {
      console.log("onsuccess", data);
      onSuccess(modified.obj.name);
    },
    onError: (err) => {
      console.log("onerror", err);
      let errStr = _.isString(err.body)
        ? err.body
        : JSON.stringify(err.body, null, 2);
      setErrorMsg({
        message: `${TASK_SAVE_FAILED}: ${errStr}`,
        dismissible: true,
      });
    },
  });

  useEffect(() => {
    if (modified.isClash) {
      setErrorMsg({
        message: "Cannot save task definition. Task name already in use.",
        dismissible: false,
      });
    } else {
      setErrorMsg(undefined);
    }
  }, [modified]);

  const handleSave = () => {
    saveTask({ body: modified.obj, isNew: modified.isNew });
  };

  const diffEditorDidMount = (editor) => {
    diffMonacoRef.current = editor;
  };

  return (
    <Dialog fullScreen open={!!document} onClose={() => onCancel()}>
      <Snackbar
        open={!!errorMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transitionDuration={{ exit: 0 }}
      >
        <Alert
          severity="error"
          onClose={
            _.get(errorMsg, "dismissible")
              ? () => setErrorMsg(undefined)
              : undefined
          }
        >
          {_.get(errorMsg, "message")}
        </Alert>
      </Snackbar>

      {isLoading && <LinearProgress />}

      <Toolbar className={classes.toolbar}>
        <Text>
          Saving{" "}
          <span style={{ fontWeight: "bold" }}>
            {_.get(modified, "obj.name")}
          </span>
        </Text>

        {modified.isNew && <Pill label="New" color="yellow" />}

        <div className={classes.rightButtons}>
          <Button onClick={handleSave} disabled={modified.isClash}>
            Save
          </Button>
          <Button onClick={() => onCancel()} variant="secondary">
            Cancel
          </Button>
        </div>
      </Toolbar>

      {document && (
        <DiffEditor
          height={"100%"}
          width={"100%"}
          theme="vs-light"
          language="json"
          original={document.original}
          modified={document.modified}
          onMount={diffEditorDidMount}
          options={{
            autoIndent: true,
            selectOnLineNumbers: true,
            readOnly: true,
            minimap: {
              enabled: false,
            },
          }}
        />
      )}
    </Dialog>
  );
}
