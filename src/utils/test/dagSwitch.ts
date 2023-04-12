import WorkflowDAG, { TaskResult } from "../../components/diagram/WorkflowDAG";
import { WorkflowExecution } from "./mockWorkflow";
import { v4 as uuidv4 } from "uuid";


export function dagSwitchDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");

  workflow.pushSwitch("switch_task",2,2);
  return WorkflowDAG.fromWorkflowDef(workflow.toJSON().execution.workflowDefinition);
}


export function dagSwitchUnexecuted() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushSwitch("switch_task",2,2);

  // Flush tasks
  workflow.tasks = [];
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}


export function dagSwitchSuccess(caseTaken?: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSwitch("switch_task",2,2, caseTaken);

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}
