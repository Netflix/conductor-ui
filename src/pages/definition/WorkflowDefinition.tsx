import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { LinearProgress } from "../../components";
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
  staging: WorkflowDef;
  dag: WorkflowDAG;
  selectedTask: TaskCoordinate | null;
  setStaging: (workflowDef: WorkflowDef, dag?: WorkflowDAG) => void;
  setSelectedTask: (coord: TaskCoordinate | null) => void;
  refetchWorkflow: () => void;
  isModified: boolean;
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
  const workflowVersion = params.version;

  const [staging, setStagingRaw] = useState<WorkflowDef | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<TaskCoordinate | null>(null);
  const [dag, setDag] = useState<WorkflowDAG | undefined>(undefined);

  const {
    data: original,
    isFetching,
    refetch: refetchWorkflow,
  } = useWorkflowDef(workflowName, workflowVersion, NEW_WORKFLOW_TEMPLATE);

  const setStaging = useCallback(
    (newStaging: WorkflowDef, newDag?: WorkflowDAG) => {
      setStagingRaw(newStaging);
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
    },
    [setStagingRaw, setDag, selectedTask],
  );

  useEffect(() => {
    if (!!original) {
      setStaging(original);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const isModified = useMemo(
    () => !!staging && original !== staging,
    [original, staging],
  );

  return (
    <>
      <Helmet>
        <title>
          Conductor UI - Workflow Definition - {workflowName || "New Workflow"}
        </title>
      </Helmet>

      {isFetching && <LinearProgress />}
      {staging && (
        <DefEditorContext.Provider
          value={{
            workflowName,
            workflowVersion: workflowVersion
              ? parseInt(workflowVersion)
              : undefined,
            original: original!,
            staging: staging,
            dag: dag!,
            setStaging,
            selectedTask,
            setSelectedTask,
            refetchWorkflow,
            isModified,
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
                          title: "Task Config",
                          content: <TaskConfigPanel />,
                        },
                        {
                          id: "JsonPanel",
                          title: "JSON",
                          content: <JsonPanel />,
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
