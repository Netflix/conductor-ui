import React, { useMemo } from "react";
import { useContext } from "react";
import TaskInput from "./taskTabs/TaskInput";
import TaskOutput from "./taskTabs/TaskOutput";
import TaskSummary from "./taskTabs/TaskSummary";
import TaskPollData from "./taskTabs/TaskPollData";
import TaskLogs from "./taskTabs/TaskLogs";
import TaskExecution from "./taskTabs/TaskExecution";
import TaskConfiguration from "./taskTabs/TaskConfiguration";
import { ExecutionAndTasks } from "../../types/execution";
import WorkflowDAG from "../../components/diagram/WorkflowDAG";
import WorkflowGraph from "../../components/diagram/WorkflowGraph";
import {
  IncompleteDFChildTaskConfig,
  TaskConfig,
  TaskCoordinate,
} from "../../types/workflowDef";
import Summary from "./workflowTabs/Summary";
import TaskList from "./workflowTabs/TaskList";
import TimelineComponent from "./workflowTabs/Timeline";
import WorkflowInput from "./workflowTabs/WorkflowInput";
import WorkflowOutput from "./workflowTabs/WorkflowOutput";
import WorkflowVariables from "./workflowTabs/WorkflowVariables";
import WorkflowJson from "./workflowTabs/WorkflowJson";

export type TaskSelection = {
  ref?: string;
  id?: string;
  workflowId: string;
  taskConfig: TaskConfig | IncompleteDFChildTaskConfig;
};

type ITileFactoryContext = {
  executionAndTasks: ExecutionAndTasks;
  dag: WorkflowDAG;
  selectedTask?: TaskCoordinate;
  setSelectedTask?: (selectedTask: TaskCoordinate) => void;
};

export const TileFactoryContext = React.createContext<
  ITileFactoryContext | undefined
>(undefined);


export default function tabLoader(component){
  switch (component) {
    case "WorkflowGraph":
      return {
        id: "WorkflowGraph",
        title: "Graph",
        content: <WorkflowGraph
          selectedTask={selectedTask}
          executionMode={true}
          dag={dag}
          onTaskSelect={setSelectedTask}
        />
      }
    case "WorkflowSummary":

      return {
        id: "WorkflowSummary",
        title: "Summary",
        content: <TileFactory component="WorkflowSummary" />,
        group: "workflow",
      }
    case "WorkflowJson":
      return {
        id: "WorkflowJson",
        title: "JSON",
        content: <TileFactory component="WorkflowJson" />,
        group: "workflow",
      }
    case "TaskList":
      return  {
        id: "TaskList",
        title: "Tasks",
        content: <TileFactory component="TaskList" />,
        group: "workflow",
      }
    case "Timeline":
      return   {
        id: "Timeline",
        title: "Timeline",
        content: <TileFactory component="Timeline" />,
        group: "workflow",
      }
    case WorkflowInput: 
      return {
        id: "WorkflowInput",
        title: "Input",
        content: <TileFactory component="WorkflowInput" />,
        group: "workflow",
      }
    
    case WorkflowOutput:
      return {
        id: "WorkflowOutput",
        title: "Output",
        content: <TileFactory component="WorkflowOutput" />,
        group: "workflow",
      }
    case WorkflowVariables:
      return {
        id: "WorkflowVariables",
        title: "Variables",
        content: <TileFactory component="WorkflowVariables" />,
        group: "workflow",
      }
    case TaskSummary:
      return {
        title: "Summary",
        id: "TaskSummary",
        content: <TileFactory component="TaskSummary" />,
        group: "task",
      }
    case TaskInput:
      return {
        title: "Input",
        id: "TaskInput",
        content: <TileFactory component="TaskInput" />,
        group: "task",

      }
    case TaskOutput: 
      return {
        title: "Output",
        id: "TaskOutput",
        content: <TileFactory component="TaskOutput" />,
        group: "task",
      }
    case TaskPollData:
      return {
        title: "Poll Data",
        id: "TaskPollData",
        content: <TileFactory component="TaskPollData" />,
        group: "task",
      }
    case TaskLogs:
      return  {
        title: "Logs",
        id: "TaskLogs",
        content: <TileFactory component="TaskLogs" />,
        group: "task",
      }
   
    case TaskConfig:
      {
        title: "Config",
        id: "TaskConfig",
        content: <TileFactory component="TaskConfig" />,
        group: "task",
      }
    case TaskExecution:
      {
        title: "Results",
        id: "TaskExecution",
        content: <TileFactory component="TaskExecution" />,
        group: "task",
      },
    }
      /*
    case "WorkflowJson":
      return <WorkflowJson execution={execution} />;

    case "WorkflowSummary":
      return <Summary execution={execution} />;
    case "TaskList":
      return <TaskList tasks={tasks} workflowId={execution.workflowId} />;
    case "Timeline":
      return (
        <TimelineComponent
          dag={dag}
          tasks={executionAndTasks.tasks}
          onClick={setSelectedTask}
        />
      );
    case "WorkflowInput":
      return <WorkflowInput workflowId={execution.workflowId} />;
    case "WorkflowOutput":
      return <WorkflowOutput workflowId={execution.workflowId} />;
    case "WorkflowVariables":
      return <WorkflowVariables workflowId={execution.workflowId} />;

    case "TaskSummary":
      return <TaskSummary taskSelection={taskSelection} />;
    case "TaskInput":
      return <TaskInput taskSelection={taskSelection} />;
    case "TaskOutput":
      return <TaskOutput taskSelection={taskSelection} />;
    case "TaskPollData":
      return <TaskPollData taskSelection={taskSelection} />;
    case "TaskLogs":
      return <TaskLogs taskSelection={taskSelection} />;
    case "TaskConfig":
      return <TaskConfiguration taskSelection={taskSelection} />;
    case "TaskExecution":
      return <TaskExecution taskSelection={taskSelection} />;
    default:
      return null;
      */
  }
}

function ExecutionLoader({ Component }: { Component: any }) {
  const context = useContext(TileFactoryContext);
  const { selectedTask, setSelectedTask, dag, executionAndTasks } = context!;

  const taskSelection: TaskSelection | undefined = useMemo(() => {
    if (!dag || !selectedTask || !executionAndTasks) {
      return undefined;
    }
    const taskResult = dag.getTaskResultByCoord(selectedTask);
    const taskConfig = dag.getTaskConfigByCoord(selectedTask);

    return {
      id: taskResult?.taskId,
      ref: taskResult?.referenceTaskName,
      workflowId: executionAndTasks.execution!.workflowId,
      taskConfig: taskConfig,
    };
  }, [dag, selectedTask, executionAndTasks]);

  const { execution, tasks } = executionAndTasks;

  if (!dag || !execution || !tasks) {
    return null;
  }
  return <Component taskSelection={taskSelection} />

}
