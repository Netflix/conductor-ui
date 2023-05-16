import { useRef, useMemo } from "react";
import rison from "rison";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useExecutionAndTasks, useWorkflowDag } from "../../data/execution";
import { TaskCoordinate } from "../../types/workflowDef";

import TileFactory, { TileFactoryContext } from "./TileFactory";

import "flexlayout-react/style/light.css";
import "../../components/rc-dock.css"
import DockLayout, { LayoutData, TabGroup } from "rc-dock";
import ExecutionHeader from "./ExecutionHeader";
import { useQueryState } from "react-router-use-location-state";
import LinearProgress from "../../components/LinearProgress";
import { DropdownButton } from "../../components";
import { MoreHoriz } from "@mui/icons-material";

import useLocalStorageState from 'use-local-storage-state'

const defaultLayout: LayoutData = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        tabs: [
          {
            id: "WorkflowGraph",
            title: "Graph",
            content: <TileFactory component="WorkflowGraph" />,
            group: "workflow",
          },
          {
            id: "WorkflowSummary",
            title: "Summary",
            content: <TileFactory component="WorkflowSummary" />,
            group: "workflow",
          },
          {
            id: "WorkflowJson",
            title: "JSON",
            content: <TileFactory component="WorkflowJson" />,
            group: "workflow",
          },
          {
            id: "TaskList",
            title: "Tasks",
            content: <TileFactory component="TaskList" />,
            group: "workflow",
          },
          {
            id: "Timeline",
            title: "Timeline",
            content: <TileFactory component="Timeline" />,
            group: "workflow",
          },
          {
            id: "WorkflowInput",
            title: "Input",
            content: <TileFactory component="WorkflowInput" />,
            group: "workflow",
          },
          {
            id: "WorkflowOutput",
            title: "Output",
            content: <TileFactory component="WorkflowOutput" />,
            group: "workflow",
          },
          {
            id: "WorkflowVariables",
            title: "Variables",
            content: <TileFactory component="WorkflowVariables" />,
            group: "workflow",
          },
        ],
      },
      {
        tabs: [
          {
            title: "Summary",
            id: "TaskSummary",
            content: <TileFactory component="TaskSummary" />,
            group: "task",

          },
          {
            title: "Input",
            id: "TaskInput",
            content: <TileFactory component="TaskInput" />,
            group: "task",

          },
          {
            title: "Output",
            id: "TaskOutput",
            content: <TileFactory component="TaskOutput" />,
            group: "task",
          },
          {
            title: "Poll Data",
            id: "TaskPollData",
            content: <TileFactory component="TaskPollData" />,
            group: "task",
          },
          {
            title: "Logs",
            id: "TaskLogs",
            content: <TileFactory component="TaskLogs" />,
            group: "task",
          },
          {
            title: "Config",
            id: "TaskConfig",
            content: <TileFactory component="TaskConfig" />,
            group: "task",
          },
          {
            title: "Results",
            id: "TaskExecution",
            content: <TileFactory component="TaskExecution" />,
            group: "task",
          },
        ],
      },
    ],
  },
};

export default function Execution() {
  const params = useParams<{ id: string }>();
  const dockRef = useRef<DockLayout>(null);
  const [layout, setLayout] = useLocalStorageState<LayoutData>('executionLayout', defaultLayout)
  console.log(layout);


  const [selectedTaskRison, setSelectedTaskRison] = useQueryState("task", "");

  if (!params.id) {
    throw new Error("Missing Execution ID");
  }
  const executionAndTasks = useExecutionAndTasks(params.id);
  const dag = useWorkflowDag(executionAndTasks);
  const { execution, tasks, loading } = executionAndTasks;

  const selectedTask: TaskCoordinate | undefined = useMemo(
    () => (selectedTaskRison ? rison.decode(selectedTaskRison) : undefined),
    [selectedTaskRison]
  );

  const setSelectedTask = (taskPointer: TaskCoordinate) => {
    setSelectedTaskRison(rison.encode(taskPointer));
  };


  const groups: { [key: string]: TabGroup } = {
    workflow: { 
      animated: false,
      floatable: false,
      maximizable: true,
      panelExtra: (panelData, context) => {
        return <>
            <div className={ panelData.parent!.mode === 'maximize' ? "dock-panel-min-btn" :  "dock-panel-max-btn"} onClick={() => context.dockMove(panelData, null, 'maximize')}></div>
            <DropdownButton
            size="small"
            icon={<MoreHoriz fontSize="inherit" />}
            options={[
              {
                label: "Save Layout",
                handler: () => console.log(dockRef.current!.saveLayout())
              },
              {
                label: "Restore Default",
                handler: () => console.log("default")
              }
            ]}
          />
          </>
      }
      
    },
    task: { 
      animated: false,
      floatable: false,
      maximizable: true
    },
  };
  
  return (
    <>
      <Helmet>
        <title>Conductor UI - Execution - {params.id}</title>
      </Helmet>
      {loading && <LinearProgress />}
      {dag && execution && tasks && (
        <TileFactoryContext.Provider
          value={{
            executionAndTasks,
            dag,
            selectedTask,
            setSelectedTask,
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ExecutionHeader execution={execution} />
            <DockLayout
              ref={dockRef}
              dropMode="edge"
              style={{ width: "100%", height: "100%" }}
              defaultLayout={defaultLayout}
              groups={groups}
            />
          </div>
        </TileFactoryContext.Provider>
      )}
    </>
  );
}
