import WorkflowDAG from "../../components/diagram/WorkflowDAG";
import { TaskResult } from "../../types/execution";
import { WorkflowExecution } from "./mockWorkflow";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

export function dagDoWhileDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDoWhile("loop_task", 2, 1);

  return WorkflowDAG.fromWorkflowDef(
    workflow.toJSON().execution.workflowDefinition,
  );
}

export function dagDoWhileUnexecuted() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushDoWhile("loop_task", 2, 0);

  // Flush tasks
  workflow.tasks = [];
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDoWhileSuccess(iterations = 5) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDoWhile("loop_task", 2, iterations);

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDoWhileFailure(iterations = 5) {
  const workflow = new WorkflowExecution("test_workflow", "FAILED");
  workflow.pushDoWhile("loop_task", 2, iterations);

  // Fail loop
  workflow.tasks.find(
    (task) => task.referenceTaskName === "loop_task",
  )!.status = "FAILED";

  // Fail last loop task
  const child1 = workflow.tasks.filter(
    (task) => task.referenceTaskName === "loop_task_child1",
  );
  _.last(child1)!.status = "FAILED";

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagDoWhileRetries(iterations = 5) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDoWhile("loop_task", 2, iterations);

  // Duplicate last task
  const taskToRetry = workflow.tasks.find(
    (task) =>
      task.referenceTaskName === `loop_task_child1` &&
      task.iteration === iterations - 1,
  ) as TaskResult;

  workflow.tasks.push({
    ...taskToRetry,
    taskId: uuidv4(),
    retried: true,
    retryCount: 1,
  });

  taskToRetry.status = "FAILED";
  taskToRetry.retried = true;

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}
