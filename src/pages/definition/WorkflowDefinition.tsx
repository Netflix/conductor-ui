import { useState, useEffect } from "react";
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

type WorkflowDefParams = {
  name: string;
  version: string;
};

export type IDefEditorContext = {
  workflowName: string;
  workflowVersion: string;
  workflowDef: WorkflowDef;
  selectedTask: TaskCoordinate | null;
  setWorkflowDef: (workflowDef: WorkflowDef) => void;
  setSelectedTask: (coord: TaskCoordinate | null) => void;
  refetchWorkflow: () => void;
};

export const DefEditorContext = React.createContext<
  IDefEditorContext | undefined
>(undefined);

export default function Workflow() {
  const params = useParams<WorkflowDefParams>();

  const workflowName = params.name as string;
  const workflowVersion = params.version as string;
  const [workflowDef, setWorkflowDef] = useState<WorkflowDef | undefined>(
    undefined,
  );
  const [selectedTask, setSelectedTask] = useState<TaskCoordinate | null>(null);

  const {
    data: remoteWorkflowDef,
    isFetching,
    refetch: refetchWorkflow,
  } = useWorkflowDef(workflowName, workflowVersion, NEW_WORKFLOW_TEMPLATE);

  useEffect(() => {
    setWorkflowDef(remoteWorkflowDef);
  }, [remoteWorkflowDef]);

  return (
    <>
      <Helmet>
        <title>
          Conductor UI - Workflow Definition - {workflowName || "New Workflow"}
        </title>
      </Helmet>

      {isFetching && <LinearProgress />}
      {workflowDef && (
        <DefEditorContext.Provider
          value={{
            workflowName,
            workflowVersion,
            workflowDef,
            selectedTask,
            setSelectedTask,
            setWorkflowDef,
            refetchWorkflow,
          }}
        >
          <DockLayout
            style={{ width: "100%", height: "100%" }}
            defaultLayout={{
              dockbox: {
                mode: "horizontal",
                children: [
                  {
                    group: "workflow",
                    tabs: [
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
          />
        </DefEditorContext.Provider>
      )}
    </>
  );
}
