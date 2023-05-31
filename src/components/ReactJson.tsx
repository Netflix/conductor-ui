import React, { useEffect, useRef } from "react";
import { makeStyles } from "@mui/styles";
import { InputLabel, IconButton, Tooltip } from "@mui/material";
import clsx from "clsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Editor } from "@monaco-editor/react";

const useStyles = makeStyles({
  monaco: {},
  outerWrapper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    paddingTop: 15,
  },
  editorWrapper: {
    flex: 1,
    marginLeft: 10,
    position: "relative",
    minHeight: 0,
  },
  label: {
    marginTop: 13,
    marginBottom: 10,
    flex: 1,
  },
  toolbar: {
    gap: 5,
    paddingRight: 15,
    paddingLeft: 15,
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "row",
  },
});

type ReactJsonProps = {
  className?: string;
  label?: string;
  src: any;
  lineNumbers?: boolean;
  path?: string;
};

export default function ReactJson({
  className,
  label,
  src,
  lineNumbers = true,
}: ReactJsonProps) {
  const classes = useStyles();
  const editorRef = useRef<any>(null);

  function handleEditorMount(editor: any) {
    editorRef.current = editor;
  }

  function handleCopyAll() {
    const editor = editorRef.current;
    const range = editor.getModel().getFullModelRange();
    editor.setSelection(range);
    editor
      .getAction("editor.action.clipboardCopyWithSyntaxHighlightingAction")
      .run();
  }

  function handleExpandAll() {
    editorRef.current.getAction("editor.unfoldAll").run();
  }

  function handleCollapse() {
    editorRef.current.getAction("editor.foldLevel2").run();
  }

  return (
    <div className={clsx([classes.outerWrapper, className])}>
      <div className={classes.toolbar}>
        <InputLabel variant="outlined" className={classes.label}>
          {label}
        </InputLabel>

        <Tooltip title="Collapse All">
          <IconButton onClick={handleCollapse} size="small">
            <ExpandLessIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Expand All">
          <IconButton onClick={handleExpandAll} size="small">
            <ExpandMoreIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy All">
          <IconButton onClick={handleCopyAll} size="small">
            <FileCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </div>
      <div className={classes.editorWrapper}>
        <Editor
          value={JSON.stringify(src, null, 2)}
          className={classes.monaco}
          defaultLanguage="json"
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            tabSize: 2,
            minimap: { enabled: false },
            lightbulb: { enabled: false },
            scrollbar: { useShadows: false },
            quickSuggestions: false,
            showFoldingControls: "always",
            lineNumbers: lineNumbers ? "on" : "off",

            // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            renderLineHighlight: "none",

            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
}
