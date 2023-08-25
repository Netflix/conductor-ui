import { useRef, useEffect } from "react";
import { useField } from "formik";
import Editor, { OnChange } from "@monaco-editor/react";
import { makeStyles } from "@mui/styles";
import { FormHelperText, InputLabel } from "@mui/material";
import clsx from "clsx";

const useStyles = makeStyles({
  wrapper: {
    width: "100%",
  },
  monaco: {
    padding: 10,
    width: "100%",
    borderColor: "rgba(128, 128, 128, 0.2)",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "rgb(255, 255, 255)",
    "&:focus-within": {
      margin: -2,
      borderColor: "rgb(73, 105, 228)",
      borderStyle: "solid",
      borderWidth: 2,
    },
  },
  label: {
    display: "block",
    marginBottom: 8,
  },
});

type JsonInputProps = {
  label: string;  
  value: string;
  onChange: OnChange;
  language?: string;  
  height?: string | number;
  error?: string;
  className?: string;
  style?: any;
}

export default function JsonInput ({
  className,
  style,
  label,
  height,
  language = "json",
  error,
  value,
  onChange
}: JsonInputProps) {
  const classes = useStyles();
  const editorRef = useRef(null);

  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  return (
    <div className={clsx([classes.wrapper, className])} style={style}>
      <InputLabel variant="outlined" error={!!error}>
        {label}
      </InputLabel>

      <Editor
        className={classes.monaco}
        height={height || 90}
        defaultLanguage={language}
        onMount={handleEditorMount}
        onChange={onChange}
        value={value}
        options={{
          tabSize: 2,
          minimap: { enabled: false },
          lightbulb: { enabled: false },
          quickSuggestions: false,

          lineNumbers: "off",
          glyphMargin: false,
          folding: false,
          // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          renderLineHighlight: "none",

          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "hidden",
          },
          overviewRulerBorder: false,
        }}
      />

      {error? (
        <FormHelperText variant="outlined" error>
          {error}
        </FormHelperText>
      ) : null}
    </div>
  );
}
