import { useCallback, useContext } from "react";
import { DefEditorContext } from "../WorkflowDefinition";
import HttpTaskConfigurator from "./taskconfigurator/HttpTaskConfigurator";
import InlineTaskConfigurator from "./taskconfigurator/InlineTaskConfigurator";
import TaskConfigurator from "./taskconfigurator/SimpleTaskConfigurator";
import {
  DoWhileTaskConfig,
  DynamicForkTaskConfig,
  ForkTaskConfig,
  JoinTaskConfig,
  SubworkflowTaskConfig,
  SwitchTaskConfig,
  TaskConfig,
} from "../../../types/workflowDef";
import TerminateTaskConfigurator from "./taskconfigurator/TerminateTaskConfigurator";
import WaitTaskConfigurator from "./taskconfigurator/WaitTaskConfigurator";
import JQTransformTaskConfigurator from "./taskconfigurator/JQTransformTaskConfigurator";
import DOWHILETaskConfigurator from "./taskconfigurator/DoWhileTaskConfigurator";
import JoinTaskConfigurator from "./taskconfigurator/JoinTaskConfigurator";
import ForkJoinTaskConfigurator from "./taskconfigurator/ForkJoinTaskConfigurator";
import ForkJoinDynamicTaskConfigurator from "./taskconfigurator/ForkJoinDynamicTaskConfigurator";
import SwitchTaskConfigurator from "./taskconfigurator/SwitchTaskConfigurator";
import SubWorkflowTaskConfigurator from "./taskconfigurator/SubWorkflowTaskConfigurator";
import { useStyles } from "./taskconfigurator/TaskConfiguratorUtils";

export type TaskConfiguratorProps = {
  initialConfig: TaskConfig;
  onUpdate: (taskConfig: TaskConfig) => void;
  onChanged: (changed: boolean) => void;
};

export default function TaskConfigPanel({
  setSeverity,
}: {
  setSeverity: (EditorTabSeverity) => void;
}) {
  const context = useContext(DefEditorContext)!;
  const { dag, selectedTask, setStaging } = context!;

  const taskConfig = selectedTask && dag.getTaskConfigByCoord(selectedTask);
  const classes = useStyles();

  const handleTaskChanged = useCallback(
    (value) => {
      setSeverity(value ? "INFO" : undefined);
    },
    [setSeverity],
  );

  if (!selectedTask) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#fafafd",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>Select a task by clicking on it in the Workflow Builder.</div>
      </div>
    );
  }

  const handleTaskConfiguratorUpdate = (updatedState) => {
    const originalRef = taskConfig?.taskReferenceName;
    const newDag = dag.clone();
    if (originalRef) {
      newDag.updateTask(originalRef, updatedState);
    }
    setStaging("TaskConfigPanel", newDag.toWorkflowDef(), newDag);
  };

  return (
    <div style={{ height: "100%", overflowY: "scroll" }}>
      {taskConfig !== null && taskConfig.type === "HTTP" ? (
        <HttpTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "INLINE" ? (
        <InlineTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "SIMPLE" ? (
        <TaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "TERMINATE" ? (
        <TerminateTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "WAIT" ? (
        <WaitTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "JSON_JQ_TRANSFORM" ? (
        <JQTransformTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "DO_WHILE" ? (
        <DOWHILETaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig as DoWhileTaskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "JOIN" ? (
        <JoinTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig as JoinTaskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "FORK_JOIN" ? (
        <ForkJoinTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig as ForkTaskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "FORK_JOIN_DYNAMIC" ? (
        <ForkJoinDynamicTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig as DynamicForkTaskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "SWITCH" ? (
        <SwitchTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig as SwitchTaskConfig}
          onChanged={handleTaskChanged}
        />
      ) : taskConfig !== null && taskConfig.type === "SUB_WORKFLOW" ? (
        <SubWorkflowTaskConfigurator
          onUpdate={handleTaskConfiguratorUpdate}
          initialConfig={taskConfig as SubworkflowTaskConfig}
          onChanged={handleTaskChanged}
        />
      ) : (
        <div className={classes.container}>
          Task Type not currently supported by Task Configurator. Please use the
          JSON panel instead.
        </div>
      )}
    </div>
  );
}
