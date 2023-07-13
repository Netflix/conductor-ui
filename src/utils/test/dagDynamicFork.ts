import WorkflowDAG from "../../components/diagram/WorkflowDAG";
import { WorkflowExecution } from "./mockWorkflow";
import { v4 as uuidv4 } from "uuid";

// DYNAMIC FORK
export function dagDynamicForkDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDynamicFork("dynamic_fork", 0);

  return WorkflowDAG.fromWorkflowDef(
    workflow.toJSON().execution.workflowDefinition,
  );
}

export function dagDynamicForkUnexecuted() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushDynamicFork("dynamic_fork", 0, undefined, "SCHEDULED");

  // Clear tasks
  workflow.tasks = [];

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDynamicForkNoneSpawned() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDynamicFork("dynamic_fork", 0);
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDynamicForkSuccess(fanout: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDynamicFork("dynamic_fork", fanout);

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDynamicForkFailure(fanout: number) {
  const workflow = new WorkflowExecution("test_workflow", "FAILED");
  workflow.pushDynamicFork("dynamic_fork", fanout, fanout - 1);

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDynamicForkRetries(fanout: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDynamicFork("dynamic_fork", fanout);

  // Append extra retry to one of the forked tasks
  const taskToRetry = workflow.tasks[fanout];
  taskToRetry.status = "FAILED";
  workflow.tasks.splice(fanout + 1, 0, {
    ...taskToRetry,
    taskId: uuidv4(),
    status: "COMPLETED",
  });

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}
