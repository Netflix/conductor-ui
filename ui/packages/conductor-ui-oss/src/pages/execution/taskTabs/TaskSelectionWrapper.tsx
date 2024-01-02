import React, { useContext, useMemo } from "react";
import { Alert } from "@mui/material";
import Blank from "../../../components/Blank";
import { TileFactoryContext } from "../tabLoader";
import { TaskResult } from "../../../export";
import {
  TaskConfig,
  IncompleteDFChildTaskConfig,
} from "../../../types/workflowDef";

export type TaskSelection =
  | {
      taskResult: TaskResult;
      workflowId: string;
      taskConfig: TaskConfig | IncompleteDFChildTaskConfig;
    }
  | undefined;

export type TaskPanelProps = {
  taskSelection: TaskSelection | undefined;
};

export default function TaskSelectionWrapper({
  TaskPanel,
}: {
  TaskPanel: React.FC<TaskPanelProps>;
}) {
  const { dag, selectedTask, executionAndTasks } =
    useContext(TileFactoryContext);

  const {
    taskSelection,
    invalidTaskId,
  }: TaskPanelProps & { invalidTaskId: boolean } = useMemo(() => {
    if (!dag || !selectedTask) {
      return { taskSelection: undefined, invalidTaskId: false };
    }
    let taskResult, taskConfig;

    try {
      taskResult = dag.getTaskResultByCoord(selectedTask);
      taskConfig = dag.getTaskConfigByCoord(selectedTask);
    } catch (e) {
      console.log(e);
      return { taskSelection: undefined, invalidTaskId: true };
    }

    return {
      taskSelection: {
        workflowId: executionAndTasks.execution.workflowId,
        taskResult: taskResult,
        taskConfig: taskConfig,
      },
      invalidTaskId: false,
    };
  }, [dag, selectedTask, executionAndTasks]);

  return (
    <>
      {!invalidTaskId && <TaskPanel taskSelection={taskSelection} />}
      {invalidTaskId && (
        <Blank center={false}>
          <Alert severity="error" style={{ margin: 15 }}>
            The selected task cannot be found. The workflow may have been
            restarted. Please select another task from the graph.
          </Alert>
        </Blank>
      )}
    </>
  );
}
