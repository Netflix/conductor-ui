import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Pill } from "../../../components";
import { Toolbar, Tooltip } from "@mui/material";
import _ from "lodash";
import Editor, { Monaco } from "@monaco-editor/react";

import { DefEditorContext, EditorTabSeverity } from "../WorkflowDefinition";
import { makeStyles } from "@mui/styles";
import { WORKFLOW_SCHEMA } from "../../../schema/workflow";
import WorkflowDAG from "../../../data/dag/WorkflowDAG";

// TODO: import Marker type
type Marker = any;

const useStyles = makeStyles({
  column: {
    flex: 1,
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },
  editorLineDecorator: {
    backgroundColor: "rgb(45, 45, 45, 0.1)",
  },
  editor: {
    flex: 1,
  },
  spaceBetween: {
    justifyContent: "space-between",
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

export default function JsonPanel({
  setSeverity,
}: {
  setSeverity: (EditorTabSeverity) => void;
}) {
  const classes = useStyles();
  const context = useContext(DefEditorContext);
  const { selectedTask, dag, setStaging } = context!;

  // false=idle (dialog closed)
  // undefined= Ask to reset to current_version
  // otherwise Ask to reset to version id
  const [decorations, setDecorations] = useState([]);
  const [jsonErrors, setJsonErrors] = useState<Marker[]>([]);
  const [workingText, setWorkingText] = useState<string>();
  const [changed, setChanged] = useState<boolean>(false);

  useEffect(() => {
    setWorkingText(JSON.stringify(dag.toWorkflowDef(), null, 2));
    setChanged(false);
  }, [dag]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTask, classes]);

  const editorRef = useRef<any | null>(null);

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

  const handleChange = (v) => {
    setWorkingText(v);
    setChanged(true);
  };

  const handleCommit = () => {
    try {
      const workingDef = JSON.parse(workingText!);
      const dag = WorkflowDAG.fromWorkflowDef(workingDef);
      setStaging("JsonPanel", workingDef, dag);
    } catch (e) {
      console.log("error parsing into dag");
    }
  };

  const errorLevel: EditorTabSeverity = useMemo(() => {
    const maxLevel = Math.max(...jsonErrors.map((err) => err.severity));
    if (maxLevel > 4) {
      return "ERROR";
    } else if (maxLevel > 0) {
      return "WARNING";
    } else if (changed) {
      return "INFO";
    } else {
      return undefined;
    }
  }, [jsonErrors, changed]);

  useEffect(() => {
    setSeverity(errorLevel);
  }, [setSeverity, errorLevel]);

  return (
    <div className={classes.column}>
      <Toolbar variant="dense">
        {errorLevel === "ERROR" && (
          <Tooltip disableFocusListener title="There are JSON syntax errors.">
            <div>
              <Pill color="red" label="Syntax Error" />
            </div>
          </Tooltip>
        )}

        {errorLevel === "WARNING" && (
          <Tooltip
            disableFocusListener
            title="There are schema errors. Look for a yellow swiggly line under an opening brace. Errors may be at the root level (hover over first opening brace)."
          >
            <div>
              <Pill color="yellow" label="Schema Error" />
            </div>
          </Tooltip>
        )}
        <div style={{ flex: 1 }}></div>

        <Button disabled={!_.isEmpty(jsonErrors)} onClick={handleCommit}>
          Validate
        </Button>
      </Toolbar>
      <Editor
        className={classes.editor}
        height="100%"
        width="100%"
        theme="vs-light"
        language="json"
        value={workingText}
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
  );
}
