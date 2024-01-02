import { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Editor } from "@monaco-editor/react";
import { Button } from "../../../../export";
import { Link, Tooltip } from "@mui/material";
import { produce } from "immer";
import _ from "lodash";
import { Help } from "@mui/icons-material";

const useStyles = makeStyles({
  monaco: {},
  outerWrapper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
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
    paddingTop: 5,
    paddingBottom: 5,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    //backgroundColor: "rgb(250, 250, 253)",
    boxShadow: "0 1px 2px 0px rgba(0, 0, 0, 0.16)",
    zIndex: 1,
    marginBottom: 10,
  },
});

export default function InlineEditorPanel({
  initialConfig,
  onChanged,
  onUpdate,
}) {
  const classes = useStyles();

  const [workingText, setWorkingText] = useState<string>();

  useEffect(() => {
    setWorkingText(_.get(initialConfig, "inputParameters.expression", ""));
  }, [initialConfig]);

  const handleChange = useCallback(
    (value) => {
      setWorkingText(value);
      onChanged(true);
    },
    [setWorkingText, onChanged],
  );

  const handleApply = useCallback(() => {
    const newConfig = produce(initialConfig, (draft) => {
      _.set(draft!, "inputParameters.expression", workingText);
      return draft;
    });
    onUpdate(newConfig!);
  }, [onUpdate, initialConfig, workingText]);

  // Not using BasePanel so must clear bullet explicitly

  return (
    <>
      <div className={classes.outerWrapper}>
        <div className={classes.toolbar}>
          <div style={{ flex: 1 }}>
            <Tooltip
              title={
                <span>
                  Wrap imperative code in a function() and invoke it on the last
                  line. E.g.
                  <pre
                    children={`function myScript() {
  ...do this... 
  ...then that... 
}
myScript();`}
                  />
                </span>
              }
            >
              <Link color="inherit" style={{ cursor: "pointer" }}>
                Multiline Scripts <Help fontSize={"16px" as any} />
              </Link>
            </Tooltip>

            <Tooltip
              title={
                <span>
                  Workflow and Task variables should defined in{" "}
                  <code>inputParameters</code> and referenced as a property of
                  the $ object. E.g.
                  <pre>var value = $.inputParamKey;</pre>{" "}
                </span>
              }
            >
              <Link
                color="inherit"
                style={{ marginLeft: 10, cursor: "pointer" }}
              >
                Variables <Help fontSize={"16px" as any} />
              </Link>
            </Tooltip>
          </div>
          <Button variant="primary" size="small" onClick={handleApply}>
            Apply
          </Button>
        </div>
        <div className={classes.editorWrapper}>
          <Editor
            value={workingText}
            className={classes.monaco}
            defaultLanguage="javascript"
            onChange={handleChange}
            options={{
              tabSize: 2,
              minimap: { enabled: false },
              lightbulb: { enabled: false },
              scrollbar: { useShadows: false },
              quickSuggestions: false,
              showFoldingControls: "always",
              lineNumbers: "on",

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
    </>
  );
}
