import WorkflowDAG from "../../components/diagram/WorkflowDAG";
import { DoWhileTaskConfig, SwitchTaskConfig } from "../../types/workflowDef";
import { WorkflowExecution } from "./mockWorkflow";

export function dagSwitchDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");

  workflow.pushSwitch("switch_task", 2, 2);
  return WorkflowDAG.fromWorkflowDef(
    workflow.toJSON().execution.workflowDefinition,
  );
}

export function dagSwitchUnexecuted() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushSwitch("switch_task", 2, 2);

  // Flush tasks
  workflow.tasks = [];
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSwitchSuccess(caseTaken?: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSwitch("switch_task", 2, 2, caseTaken);

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSwitchDoWhileDefOnly(caseTaken?: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");

  workflow.pushDoWhile("do_while", 0, 0);
  workflow.pushSwitch("switch_task", 2, 2, caseTaken);

  // Move switch_task into loopOver
  const switchTask =
    workflow.workflowDefinition.tasks.pop() as SwitchTaskConfig;
  const loopTask = workflow.workflowDefinition.tasks[0] as DoWhileTaskConfig;
  loopTask.loopOver = [switchTask];

  return WorkflowDAG.fromWorkflowDef(
    workflow.toJSON().execution.workflowDefinition,
  );
}

export function dagSwitchDoWhileSuccess(caseTaken?: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");

  workflow.pushDoWhile("do_while", 0, 0);
  workflow.pushSwitch("switch_task", 2, 2, caseTaken);

  // Move switch_task into loopOver
  const switchTask =
    workflow.workflowDefinition.tasks.pop() as SwitchTaskConfig;
  const loopTask = workflow.workflowDefinition.tasks[0] as DoWhileTaskConfig;
  loopTask.loopOver = [switchTask];

  // Update refs to reflect switch is inside do_while
  workflow.tasks[1].referenceTaskName = "switch_task";
  workflow.tasks[2].referenceTaskName = "default_0__0";
  workflow.tasks[3].referenceTaskName = "default_1__0";

  console.log(workflow.toJSON());

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSwitchDefaultCaseNoTaskTaken() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSwitch("switch_task", 1, 1, undefined);

  // Remove the default task
  (workflow.workflowDefinition.tasks[0] as SwitchTaskConfig).defaultCase = [];
  workflow.tasks.pop();

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagSwitchDefaultCaseNoTaskNotTaken() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSwitch("switch_task", 1, 1, 0);

  // Remove the default task
  (workflow.workflowDefinition.tasks[0] as SwitchTaskConfig).defaultCase = [];

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}
