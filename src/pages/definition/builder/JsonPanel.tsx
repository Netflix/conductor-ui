import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Text,
  Select,
  Pill,
  usePushHistory,
} from "../../../components";
import { MenuItem, SelectChangeEvent, Toolbar, Tooltip } from "@mui/material";
import _ from "lodash";
import Editor, { Monaco } from "@monaco-editor/react";

import { DefEditorContext } from "../WorkflowDefinition";
import { makeStyles } from "@mui/styles";
import { WORKFLOW_SCHEMA } from "../../../schema/workflow";
import { NamesAndVersions } from "../../../types/namesAndVersions";
import { useWorkflowNamesAndVersions } from "../../../data/workflow";
import ResetConfirmationDialog from "../ResetConfirmationDialog";
import SaveWorkflowDialog from "../SaveWorkflowDialog";

// TODO: import Marker type
type Marker = any;

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    height: "100%",
    alignItems: "stretch",
  },
  workflowName: {
    fontWeight: "bold",
  },
  rightButtons: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-end",
    gap: 8,
  },
  editorLineDecorator: {
    backgroundColor: "rgb(45, 45, 45, 0.1)",
  },
});

export const JSON_FILE_NAME = "file:///workflow.json";

export function configureMonaco(monaco: any) {
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  // noinspection JSUnresolvedVariable
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true,
  });
  let modelUri = monaco.Uri.parse(JSON_FILE_NAME);
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: "http://conductor.tmp/schemas/workflow.json", // id of the first schema
        fileMatch: [modelUri.toString()], // associate with our model
        schema: WORKFLOW_SCHEMA,
      },
    ],
  });
}

export default function JsonPanel() {
  const classes = useStyles();
  const context = useContext(DefEditorContext);
  const navigate = usePushHistory();

  const [saveDialog, setSaveDialog] = useState<{
    original: string;
    originalObj: any;
    modified: string;
  } | null>(null);
  const [resetDialog, setResetDialog] = useState<false | undefined | string>(
    false,
  );
  // false=idle (dialog closed)
  // undefined= Ask to reset to current_version
  // otherwise Ask to reset to version id
  const [isModified, setIsModified] = useState<boolean>(false);
  const [decorations, setDecorations] = useState([]);
  const [jsonErrors, setJsonErrors] = useState<Marker[]>([]);

  const {
    data: namesAndVersions,
    refetch: refetchNamesAndVersions,
  }: { data?: NamesAndVersions; refetch: Function } =
    useWorkflowNamesAndVersions();
  const {
    workflowName,
    workflowVersion,
    workflowDef,
    selectedTask,
    refetchWorkflow,
  } = context!;

  const versions = useMemo(
    () => _.get(namesAndVersions, workflowName!, []),
    [namesAndVersions, workflowName],
  );

  useEffect(() => {
    if (editorRef.current) {
      if (selectedTask) {
        const editor = editorRef.current.getModel();

        const searchResult = editor.findMatches(
          `"taskReferenceName": "${selectedTask.ref}"`,
        );
        if (searchResult.length) {
          editorRef.current.revealLineInCenter(
            searchResult[0]?.range?.startLineNumber,
            0,
          );
          setDecorations(
            editorRef.current.deltaDecorations(decorations, [
              {
                range: searchResult[0]?.range,
                options: {
                  isWholeLine: true,
                  inlineClassName: classes.editorLineDecorator,
                },
              },
            ]),
          );
        }
      } else {
        setDecorations([]);
      }
    }
  }, [selectedTask, decorations, setDecorations, classes]);

  const editorRef = useRef<any | null>(null);

  const workflowJson = useMemo(
    () => (workflowDef ? JSON.stringify(workflowDef, null, 2) : ""),
    [workflowDef],
  );

  // Saving
  const handleOpenSave = () => {
    const modified = editorRef.current?.getValue();

    setSaveDialog({
      original: workflowName ? workflowJson : "",
      originalObj: workflowName ? workflowDef : null,
      modified: modified,
    });
  };

  // Version Change or Reset
  const handleResetVersion = (version: string | undefined) => {
    if (isModified) {
      setResetDialog(version);
    } else {
      changeVersionOrReset(version);
    }
  };

  const changeVersionOrReset = (version: string | undefined) => {
    if (version === workflowVersion) {
      // Reset to fetched version
      editorRef.current?.getModel().setValue(workflowJson);
    } else if (_.isUndefined(version)) {
      navigate(`/workflowDef/${workflowName}`);
    } else {
      navigate(`/workflowDef/${workflowName}/${version}`);
    }

    setResetDialog(false);
    setIsModified(false);
  };

  const handleSaveCancel = () => {
    setSaveDialog(null);
  };

  const handleSaveSuccess = (name: string, version: string) => {
    setSaveDialog(null);
    setIsModified(false);
    refetchNamesAndVersions();

    if (name === workflowName && version === workflowVersion) {
      refetchWorkflow();
    } else {
      navigate(`/workflowDef/${name}/${version}`);
    }
  };

  // Monaco Handlers
  const handleEditorWillMount = (monaco: Monaco) => {
    configureMonaco(monaco);
  };

  const handleEditorDidMount = (editor: typeof Editor) => {
    editorRef.current = editor;
  };

  const handleValidate = (markers: Marker[]) => {
    setJsonErrors(markers);
  };

  const handleChange = (v: string | undefined) => {
    setIsModified(v !== workflowJson);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Toolbar>
        <Text className={classes.workflowName}>{workflowName || "NEW"}</Text>

        <Select
          fullWidth
          label=""
          disabled={!workflowDef}
          value={_.isUndefined(workflowVersion) ? "" : workflowVersion}
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
          <Pill color="yellow" label="Modified" />
        ) : (
          <Pill label="Unmodified" />
        )}
        {!_.isEmpty(jsonErrors) && (
          <Tooltip
            disableFocusListener
            title="There are validation or syntax errors. Validation errors at the root level may be seen by hovering over the opening brace."
          >
            <div>
              <Pill color="red" label="Validation" />
            </div>
          </Tooltip>
        )}

        <div className={classes.rightButtons}>
          <Button
            disabled={!_.isEmpty(jsonErrors) || !isModified}
            onClick={handleOpenSave}
          >
            Save
          </Button>
          <Button
            disabled={!isModified}
            onClick={() => handleResetVersion(workflowVersion)}
            variant="secondary"
          >
            Reset
          </Button>
        </div>
      </Toolbar>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          width="100%"
          theme="vs-light"
          language="json"
          value={workflowJson}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onValidate={handleValidate}
          onChange={handleChange}
          options={{
            smoothScrolling: true,
            selectOnLineNumbers: true,
            minimap: {
              enabled: false,
            },
          }}
          path={JSON_FILE_NAME}
        />
      </div>

      <ResetConfirmationDialog
        version={resetDialog}
        onConfirm={changeVersionOrReset}
        onClose={() => setResetDialog(false)}
      />

      <SaveWorkflowDialog
        document={saveDialog}
        onCancel={handleSaveCancel}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}
