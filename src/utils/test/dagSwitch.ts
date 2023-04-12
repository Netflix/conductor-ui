import WorkflowDAG, { DoWhileTaskConfig, SwitchTaskConfig, TaskResult } from "../../components/diagram/WorkflowDAG";
import { WorkflowExecution } from "./mockWorkflow";
import { v4 as uuidv4 } from "uuid";


export function dagSwitchDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");

  workflow.pushSwitch("switch_task", 2, 2);
  return WorkflowDAG.fromWorkflowDef(workflow.toJSON().execution.workflowDefinition);
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
  const switchTask = workflow.workflowDefinition.tasks.pop() as SwitchTaskConfig;
  const loopTask = workflow.workflowDefinition.tasks[0] as DoWhileTaskConfig;
  loopTask.loopOver=[switchTask];

  return WorkflowDAG.fromWorkflowDef(workflow.toJSON().execution.workflowDefinition);
}


export function dagSwitchDoWhileSuccess(caseTaken?: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  
  workflow.pushDoWhile("do_while", 0, 0);
  workflow.pushSwitch("switch_task", 2, 2, caseTaken);
  
  // Move switch_task into loopOver
  const switchTask = workflow.workflowDefinition.tasks.pop() as SwitchTaskConfig;
  const loopTask = workflow.workflowDefinition.tasks[0] as DoWhileTaskConfig;
  loopTask.loopOver=[switchTask];

  // Update refs to reflect switch is inside do_while
  workflow.tasks[1].referenceTaskName = "switch_task__0"
  workflow.tasks[2].referenceTaskName = "default_0__0"
  workflow.tasks[3].referenceTaskName = "default_1__0"
  console.log(workflow.toJSON())

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}