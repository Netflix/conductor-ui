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
import Stack from "@mui/material/Stack";
import { rules, Severity, AlertItem } from "./ExpertSystemRules";

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
  severity: Severity;
  setSeverity: React.Dispatch<React.SetStateAction<Severity>>;
  hasAlerts: boolean;
  setHasAlerts: React.Dispatch<React.SetStateAction<boolean>>;
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
            <AlertComponent />
            <TileFactoryContext.Consumer>
              {({ executionAndTasks }) => (
                <Summary execution={executionAndTasks.execution} />
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
            {({ executionAndTasks }) => (
              <TaskList
                tasks={executionAndTasks.tasks}
                workflowId={executionAndTasks.execution.workflowId}
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

function AlertComponent() {
  const executionAndTasks = useContext(TileFactoryContext).executionAndTasks;
  const { severity, setSeverity, setHasAlerts } =
    useContext(TileFactoryContext);
  const alerts = useMemo(() => {
    const allAlerts: AlertItem[] = [];

    rules.forEach((rule) => {
      const [ruleAlerts, maxSeverity] = rule(executionAndTasks, severity);
      allAlerts.push(...ruleAlerts);
      setSeverity(maxSeverity);
    });

    return allAlerts;
  }, [executionAndTasks, severity, setSeverity]);

  if (alerts.length === 0) {
    return null;
  }
  setHasAlerts(true);

  return (
    <Stack sx={{ margin: "15px" }} spacing={2}>
      {alerts.map((alert, index) => (
        <React.Fragment key={index}>{alert.component}</React.Fragment>
      ))}
    </Stack>
  );
}

function SummaryTabHead() {
  const { severity, hasAlerts } = useContext(TileFactoryContext);

  if (!hasAlerts) {
    return (
      <div>
        <span style={{ marginRight: "5px" }}>Summary</span>
      </div>
    );
  }

  let dotColor;
  switch (severity) {
    case "ERROR":
      dotColor = "red";
      break;
    case "WARNING":
      dotColor = "orange";
      break;
    case "INFO":
    default:
      dotColor = "blue";
      break;
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: "5px" }}>Summary</span>
      <div
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: dotColor,
          borderRadius: "50%",
        }}
      />
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
