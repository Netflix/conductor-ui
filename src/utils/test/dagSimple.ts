import WorkflowDAG from "../../components/diagram/WorkflowDAG";
import { WorkflowExecution } from "./mockWorkflow";

// Test DAG objects
export function dagSimpleDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushSimple("simple_task", "COMPLETED", 0);
  return WorkflowDAG.fromWorkflowDef(
    workflow.toJSON().execution.workflowDefinition,
  );
}

export function dagSimpleUnexecuted() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushSimple("simple_task", "COMPLETED", 0);
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSimpleSuccess() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSimple("simple_task");

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSimpleChain() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSimple("simple_task1");
  workflow.pushSimple("simple_task2");
  workflow.pushSimple("simple_task3");

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSimpleFailure() {
  const workflow = new WorkflowExecution("test_workflow", "FAILED");
  workflow.pushSimple("simple_task", "FAILED");

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSimpleRetries() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSimple("simple_task", "COMPLETED", 3);
  workflow.tasks[0].status = "FAILED";
  workflow.tasks[1].status = "FAILED";

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}
