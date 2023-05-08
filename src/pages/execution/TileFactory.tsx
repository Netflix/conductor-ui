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

export default function TileFactory({ component }: { component: string }) {
  const context = useContext(TileFactoryContext);
  const { selectedTask, setSelectedTask, dag, executionAndTasks } =
    context || {};

  const taskSelection: TaskSelection | undefined = useMemo(() => {
    if (!dag || !selectedTask || !executionAndTasks) {
      return undefined;
    }
    const taskResult = dag.getTaskResultByCoord(selectedTask);
    const taskConfig = dag.getTaskConfigByCoord(selectedTask);

    return {
      id: taskResult?.taskId,
      ref: taskResult?.referenceTaskName,
      workflowId: executionAndTasks.execution.workflowId,
      taskConfig: taskConfig,
    };
  }, [dag, selectedTask, executionAndTasks]);

  if (!dag || !executionAndTasks) {
    return null;
  }

  switch (component) {
    case "WorkflowGraph":
      return (
        <WorkflowGraph
          selectedTask={selectedTask}
          executionMode={true}
          dag={dag}
          onTaskSelect={setSelectedTask}
        />
      );
    case "JSON":
      return (
        <WorkflowVariables
          workflowId={executionAndTasks.execution.workflowId}
        />
      );

    case "WorkflowSummary":
      return <Summary execution={executionAndTasks.execution} />;
    case "TaskList":
      return (
        <TaskList
          tasks={executionAndTasks.tasks}
          workflowId={executionAndTasks.execution.workflowId}
        />
      );
    case "Timeline":
      return (
        <TimelineComponent
          dag={dag}
          tasks={executionAndTasks.tasks}
          onClick={setSelectedTask}
        />
      );
    case "WorkflowInput":
      return (
        <WorkflowInput workflowId={executionAndTasks.execution.workflowId} />
      );
    case "WorkflowOutput":
      return (
        <WorkflowOutput workflowId={executionAndTasks.execution.workflowId} />
      );
    case "WorkflowVariables":
      return (
        <WorkflowVariables
          workflowId={executionAndTasks.execution.workflowId}
        />
      );

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
  }
}
