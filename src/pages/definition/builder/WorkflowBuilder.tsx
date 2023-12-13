import WorkflowFlow from "../../../components/diagram/WorkflowFlow";
import { TaskCoordinate } from "../../../types/workflowDef";
import React, { useContext, useCallback } from "react";
import { DefEditorContext } from "../WorkflowDefinition";
import WorkflowDAG from "../../../data/dag/WorkflowDAG";
import { shallowCompare } from "../../../utils/helpers";

const WorkflowFlowMemo = React.memo(WorkflowFlow, (prevProps, nextProps) => {
  // Optimize away extra rerenders
  return shallowCompare(prevProps, nextProps);
});

export default function WorkflowBuilder() {
  const editorContext = useContext(DefEditorContext)!;
  const { dag, setDag, setSelectedTask, selectedTask } = editorContext!;

  const handleTaskSelect = useCallback(
    (coord: TaskCoordinate | null) => {
      setSelectedTask(coord, "WorkflowFlow");
    },
    [setSelectedTask],
  );

  const handleNewTasks = useCallback(
    (dag: WorkflowDAG) => {
      setDag("WorkflowBuilder", dag);
    },
    [setDag],
  );

  return (
    <WorkflowFlowMemo
      dag={dag}
      onTaskSelect={handleTaskSelect}
      selectedTask={selectedTask}
      handleNewTasks={handleNewTasks}
    />
  );
}
