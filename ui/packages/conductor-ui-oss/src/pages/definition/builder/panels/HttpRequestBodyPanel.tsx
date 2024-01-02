/* eslint-disable no-template-curly-in-string */
import { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Editor } from "@monaco-editor/react";
import { Button } from "../../../../export";
import { produce } from "immer";
import _ from "lodash";
import BlankPanel from "./BlankPanel";

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

export default function HttpRequestBodyPanel({
  initialConfig,
  onChanged,
  onUpdate,
}) {
  const classes = useStyles();

  const [workingText, setWorkingText] = useState<string>("");
  const method = initialConfig.inputParameters?.http_request?.method;

  useEffect(() => {
    const body = _.get(initialConfig, "inputParameters.http_request.body");
    if (body) {
      setWorkingText(JSON.stringify(body, null, 2));
    } else {
      setWorkingText("");
    }
  }, [initialConfig]);

  const handleChange = useCallback(
    (value) => {
      setWorkingText(value);
      onChanged(true);
    },
    [setWorkingText, onChanged],
  );

  const handleApply = useCallback(() => {
    if (_.isEmpty(workingText)) {
      onUpdate(_.omit(initialConfig, "inputParameters.http_request.body"));
    } else {
      try {
        const parsed = JSON.parse(workingText);
        const newConfig = produce(initialConfig, (draft) => {
          _.set(draft!, "inputParameters.http_request.body", parsed);
          return draft;
        });
        onUpdate(newConfig!);
      } catch (e) {
        alert("Request Body must be valid JSON"); // TODO: Not always. Accept string if content-type is not application/json
      }
    }
  }, [onUpdate, initialConfig, workingText]);

  // Not using BasePanel so must clear bullet explicitly

  if (initialConfig.inputExpression) {
    return (
      <BlankPanel message="Request Body Editor not available when inputExpression is used." />
    );
  } else if (!(method === "POST" || method === "PUT")) {
    return (
      <BlankPanel message="Request Body Editor only available for POST and PUT methods" />
    );
  }

  return (
    <>
      <div className={classes.outerWrapper}>
        <div className={classes.toolbar}>
          <div style={{ flex: 1 }}>
            Request Body specified as templated JSON. You may reference workflow
            and task variables. e.g. <code>{'"${my_task.output.foo}"'}</code>.
          </div>
          <Button variant="primary" size="small" onClick={handleApply}>
            Apply
          </Button>
        </div>
        <div className={classes.editorWrapper}>
          <Editor
            value={workingText}
            className={classes.monaco}
            defaultLanguage="json"
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
