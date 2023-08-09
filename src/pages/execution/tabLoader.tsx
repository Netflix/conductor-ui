import React, { useContext, useMemo } from "react";
import TaskInput from "./taskTabs/TaskInput";
import TaskOutput from "./taskTabs/TaskOutput";
import TaskSummary from "./taskTabs/TaskSummary";
import TaskPollData from "./taskTabs/TaskPollData";
import TaskLogs from "./taskTabs/TaskLogs";
import TaskExecution from "./taskTabs/TaskExecution";
import TaskConfiguration from "./taskTabs/TaskConfiguration";
import { ExecutionAndTasks, TaskResult } from "../../types/execution";
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
import { TabBase, TabData } from "rc-dock";
import SiblingSelector from "./taskTabs/SiblingSelector";
import { Severity } from "./workflowTabs/ExpertSystemRules";

export type TaskSelection = {
  taskResult: TaskResult;
  workflowId: string;
  taskConfig: TaskConfig | IncompleteDFChildTaskConfig;
};

type ITileFactoryContext = {
  executionAndTasks: ExecutionAndTasks;
  dag: WorkflowDAG;
  selectedTask: TaskCoordinate | null;
  setSelectedTask: (selectedTask: TaskCoordinate | null) => void;
  severity: Severity | undefined;
  setSeverity: React.Dispatch<React.SetStateAction<Severity | undefined>>;
};

export const TileFactoryContext = React.createContext<ITileFactoryContext>(
  {} as ITileFactoryContext,
);

export default function tabLoader(tabBase: TabBase): TabData {
  switch (tabBase.id) {
    case "SiblingSelector":
      return {
        id: "SiblingSelector",
        title: "Sibling Selector",
        group: "siblingSelector",
        content: (
          <TileFactoryContext.Consumer>
            {({ selectedTask, dag, setSelectedTask }) => (
              <SiblingSelector
                dag={dag}
                selectedTask={selectedTask}
                onTaskChange={setSelectedTask}
              />
            )}
          </TileFactoryContext.Consumer>
        ),
      };
    case "WorkflowGraph":
      return {
        id: "WorkflowGraph",
        title: "Graph",
        content: (
          <TileFactoryContext.Consumer>
            {({ selectedTask, dag, setSelectedTask }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                }}
              >
                <WorkflowGraph
                  selectedTask={selectedTask}
                  executionMode={true}
                  dag={dag}
                  onTaskSelect={setSelectedTask}
                />
                <SiblingSelector
                  dag={dag}
                  selectedTask={selectedTask}
                  onTaskChange={setSelectedTask}
                />
              </div>
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };
    case "WorkflowSummary":
      return {
        id: "WorkflowSummary",
        title: <SummaryTabHead />,
        content: (
          <React.Fragment>
            <TileFactoryContext.Consumer>
              {({ executionAndTasks, setSeverity }) => (
                <Summary
                  executionAndTasks={executionAndTasks}
                  setSeverity={setSeverity}
                />
              )}
            </TileFactoryContext.Consumer>
          </React.Fragment>
        ),
        group: "workflow",
        cached: true,
      };
    case "WorkflowJson":
      return {
        id: "WorkflowJson",
        title: "JSON",
        content: (
          <TileFactoryContext.Consumer>
            {({ executionAndTasks }) => (
              <WorkflowJson execution={executionAndTasks.execution} />
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };
    case "TaskList":
      return {
        id: "TaskList",
        title: "Tasks",
        content: (
          <TileFactoryContext.Consumer>
            {({ executionAndTasks, setSelectedTask, selectedTask, dag }) => (
              <TaskList
                tasks={executionAndTasks.tasks}
                workflowId={executionAndTasks.execution.workflowId}
                setSelectedTask={setSelectedTask}
                selectedTask={selectedTask}
                dag={dag}
              />
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };
    case "Timeline":
      return {
        id: "Timeline",
        title: "Timeline",
        content: (
          <TileFactoryContext.Consumer>
            {({ dag, executionAndTasks, setSelectedTask, selectedTask }) => (
              <TimelineComponent
                dag={dag}
                tasks={executionAndTasks.tasks!}
                onClick={setSelectedTask}
                selectedTask={selectedTask}
              />
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };
    case "WorkflowInput":
      return {
        id: "WorkflowInput",
        title: "Input",
        content: (
          <TileFactoryContext.Consumer>
            {({ executionAndTasks }) => (
              <WorkflowInput
                workflowId={executionAndTasks.execution.workflowId}
              />
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };

    case "WorkflowOutput":
      return {
        id: "WorkflowOutput",
        title: "Output",
        content: (
          <TileFactoryContext.Consumer>
            {({ executionAndTasks }) => (
              <WorkflowOutput
                workflowId={executionAndTasks.execution.workflowId}
              />
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };
    case "WorkflowVariables":
      return {
        id: "WorkflowVariables",
        title: "Variables",
        content: (
          <TileFactoryContext.Consumer>
            {({ executionAndTasks }) => (
              <WorkflowVariables
                workflowId={executionAndTasks.execution.workflowId}
              />
            )}
          </TileFactoryContext.Consumer>
        ),
        group: "workflow",
      };
    case "TaskSummary":
      return {
        title: "Summary",
        id: "TaskSummary",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskSummary} />,
      };
    case "TaskInput":
      return {
        title: "Input",
        id: "TaskInput",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskInput} />,
      };
    case "TaskOutput":
      return {
        title: "Output",
        id: "TaskOutput",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskOutput} />,
      };
    case "TaskPollData":
      return {
        title: "Workers",
        id: "TaskPollData",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskPollData} />,
      };
    case "TaskLogs":
      return {
        title: "Logs",
        id: "TaskLogs",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskLogs} />,
      };
    case "TaskConfig":
      return {
        title: "Config",
        id: "TaskConfig",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskConfiguration} />,
      };
    case "TaskExecution":
      return {
        title: "Execution",
        id: "TaskExecution",
        group: "task",
        content: <TaskSelectionWrapper TaskPanel={TaskExecution} />,
      };
  }
  return {
    title: "Unknown",
    id: "Unknown",
    content: <div>Unknown</div>,
  };
}

function SummaryTabHead() {
  const { severity } = useContext(TileFactoryContext);

  let dotColor;
  if (severity === "ERROR") {
    dotColor = "red";
  } else if (severity === "WARNING") {
    dotColor = "orange";
  } else {
    dotColor = "rgba(0, 128, 255, 0.6)";
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: "5px" }}>Summary</span>
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

function TaskSelectionWrapper({ TaskPanel: Tab }: { TaskPanel: any }) {
  const { dag, selectedTask, executionAndTasks } =
    useContext(TileFactoryContext);

  const taskSelection: TaskSelection | undefined = useMemo(() => {
    if (!dag || !selectedTask) {
      return undefined;
    }
    const taskResult = dag.getTaskResultByCoord(selectedTask) as TaskResult;
    const taskConfig = dag.getTaskConfigByCoord(selectedTask);

    return {
      taskResult: taskResult,
      workflowId: executionAndTasks.execution.workflowId,
      taskConfig: taskConfig,
    };
  }, [dag, selectedTask, executionAndTasks]);

  return <Tab taskSelection={taskSelection} />;
}
