import { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { LinearProgress, usePushHistory } from "../../components";
import { Helmet } from "react-helmet";
import { useWorkflowDef } from "../../data/workflow";
import { NEW_WORKFLOW_TEMPLATE } from "../../schema/workflow";

import { TaskCoordinate, WorkflowDef } from "../../types/workflowDef";
import React from "react";
import DockLayout from "rc-dock";
import JsonPanel from "./builder/JsonPanel";
import WorkflowBuilder from "./builder/WorkflowBuilder";
import TaskConfigPanel from "./builder/TaskConfigPanel";
import BuilderToolbar from "./builder/BuilderToolbar";
import WorkflowDAG from "../../data/dag/WorkflowDAG";
import { makeStyles } from "@mui/styles";

type WorkflowDefParams = {
  name: string;
  version: string;
};

export type IDefEditorContext = {
  workflowName: string | undefined;
  workflowVersion: number | undefined;
  original: WorkflowDef;
  dag: WorkflowDAG;
  selectedTask: TaskCoordinate | null;
  setStaging: (
    sourceId: string,
    workflowDef: WorkflowDef,
    dag?: WorkflowDAG,
  ) => void;
  setSelectedTask: (coord: TaskCoordinate | null) => void;
  reload: (
    name: string | undefined,
    version: number | undefined,
    refetchWorkflow?: boolean,
  ) => void;
  isModified: boolean;
  changes: { [key: string]: EditorTabSeverity };
};

export const DefEditorContext = React.createContext<
  IDefEditorContext | undefined
>(undefined);

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
});

export default function WorkflowDefinition() {
  const params = useParams<WorkflowDefParams>();
  const classes = useStyles();
  const workflowName = params.name;
  const workflowVersion = params.version ? parseInt(params.version) : undefined;

  const [selectedTask, setSelectedTask] = useState<TaskCoordinate | null>(null);
  const [dag, setDag] = useState<WorkflowDAG | undefined>(undefined);
  const [changes, setChanges] = useState<{ [key: string]: EditorTabSeverity }>(
    {},
  );
  const [isModified, setModified] = useState(false);
  const navigate = usePushHistory();

  const {
    data: original,
    isFetching,
    refetch,
  } = useWorkflowDef(workflowName, workflowVersion, NEW_WORKFLOW_TEMPLATE);

  useEffect(() => {
    if (!!original) {
      setDag(WorkflowDAG.fromWorkflowDef(original));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const reload = (
    name: string | undefined,
    version: number | undefined,
    refetchWorkflow?: boolean,
  ) => {
    const askOverride = Object.entries(changes).reduce(
      (prev, [key, val]) => prev || !!val,
      false,
    );

    let confirmed = true;
    if (!refetchWorkflow && (askOverride || isModified)) {
      // Do not ask about override when refetch true because config just got saved.
      confirmed = window.confirm(
        "Changes not yet applied in the Task Config or JSON editor, or staged changes that have not been saved will be lost.",
      );
    }

    if (confirmed) {
      setSelectedTask(null);

      if (name === workflowName && version === workflowVersion) {
        if (refetchWorkflow) {
          console.log("refetching");
          refetch();
        } else {
          // Reset to fetched version
          console.log("resetting to fetched version");
          setDag(WorkflowDAG.fromWorkflowDef(original!));
        }
      } else if (version === undefined) {
        navigate(`/workflowDef/${name}`);
      } else {
        navigate(`/workflowDef/${name}/${version}`);
      }
      setModified(false);
    }
  };

  const setStaging = useCallback(
    (sourceId: string, newStaging: WorkflowDef, newDag?: WorkflowDAG) => {
      const askOverride = Object.entries(changes).reduce(
        (prev, [key, val]) => prev || (!!val && key !== sourceId),
        false,
      );
      console.log(sourceId, askOverride, changes)
      let confirmed = true;
      if (askOverride) {
        confirmed = window.confirm(
          "Changes not yet applied in the Task Config or JSON editor will be lost.",
        );
      }

      if (confirmed) {
        newDag = newDag || WorkflowDAG.fromWorkflowDef(newStaging);

        if (selectedTask) {
          try {
            newDag.getTaskConfigByCoord(selectedTask);
          } catch (e) {
            // Selected task changed. Unset it.
            console.log("unsetting selectedTask");
            setSelectedTask(null);
          }
        }
        setDag(newDag);
        setModified(true);
      }
    },
    [setDag, selectedTask, changes],
  );

  function setSeverity(tabId: string, severity: EditorTabSeverity) {
    setChanges((changes) => ({ ...changes, [tabId]: severity }));
  }

  return (
    <>
      <Helmet>
        <title>
          Conductor UI - Workflow Definition - {workflowName || "New Workflow"}
        </title>
      </Helmet>

      {isFetching && <LinearProgress />}
      {dag && (
        <DefEditorContext.Provider
          value={{
            workflowName,
            workflowVersion: workflowVersion,
            original: original!,
            dag: dag!,
            setStaging,
            selectedTask,
            setSelectedTask,
            reload,
            isModified,
            changes,
          }}
        >
          <div className={classes.column}>
            <BuilderToolbar />
            <DockLayout
              style={{ flex: 1, width: "100%", height: "100%" }}
              defaultLayout={{
                dockbox: {
                  mode: "horizontal",
                  children: [
                    {
                      group: "left",
                      tabs: [
                        {
                          id: "TaskConfigPanel",
                          title: (
                            <EditorTabHead
                              text="Task Config"
                              tabId="TaskConfigPanel"
                            />
                          ),
                          content: (
                            <TaskConfigPanel
                              setSeverity={(severity) =>
                                setSeverity("TaskConfigPanel", severity)
                              }
                            />
                          ),
                        },
                        {
                          id: "JsonPanel",
                          title: (
                            <EditorTabHead text="JSON" tabId="JsonPanel" />
                          ),
                          content: (
                            <JsonPanel
                              setSeverity={(severity) =>
                                setSeverity("JsonPanel", severity)
                              }
                            />
                          ),
                        },
                      ],
                    },
                    {
                      group: "task",
                      tabs: [
                        {
                          id: "WorkflowBuilder",
                          title: "Workflow Builder",
                          content: <WorkflowBuilder />,
                        },
                      ],
                    },
                  ],
                },
              }}
              groups={{
                left: {
                  animated: false,
                },
              }}
            />
          </div>
        </DefEditorContext.Provider>
      )}
    </>
  );
}

export type EditorTabSeverity = "ERROR" | "WARNING" | "INFO" | undefined;
type EditorTabHeadProps = {
  text: string;
  tabId: string;
};

function EditorTabHead({ tabId, text }: EditorTabHeadProps) {
  const { changes } = useContext(DefEditorContext)!;
  const severity = changes[tabId];

  let dotColor;
  if (severity === "ERROR") {
    dotColor = "red";
  } else if (severity === "WARNING") {
    dotColor = "orange";
  } else if (severity !== undefined) {
    dotColor = "rgba(0, 128, 255, 0.6)";
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: "5px" }}>{text}</span>
      {!!severity && (
        <div
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: dotColor,
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}
