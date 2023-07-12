import WorkflowDAG from "../../components/diagram/WorkflowDAG";
import { ForkTaskConfig } from "../../types/workflowDef";
import { TaskResult } from "../../types/execution";
import { WorkflowExecution } from "./mockWorkflow";
import { v4 as uuidv4 } from "uuid";

export function dagStaticForkDefOnly() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: [],
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig)
    .forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([
    workflow.workflowDefinition.tasks[1],
    workflow.workflowDefinition.tasks[2],
  ]);
  forkTasks.push([
    workflow.workflowDefinition.tasks[3],
    workflow.workflowDefinition.tasks[4],
  ]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(
    0,
    1,
  );

  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"],
  });
  return WorkflowDAG.fromWorkflowDef(
    workflow.toJSON().execution.workflowDefinition,
  );
}

export function dagStaticForkUnexecuted() {
  const workflow = new WorkflowExecution("test_workflow", "IN_PROGRESS");
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: [],
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig)
    .forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([
    workflow.workflowDefinition.tasks[1],
    workflow.workflowDefinition.tasks[2],
  ]);
  forkTasks.push([
    workflow.workflowDefinition.tasks[3],
    workflow.workflowDefinition.tasks[4],
  ]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(
    0,
    1,
  );

  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"],
  });

  // Clear workflow.tasks
  workflow.tasks = [];

  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagStaticForkSuccess() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: [],
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig)
    .forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([
    workflow.workflowDefinition.tasks[1],
    workflow.workflowDefinition.tasks[2],
  ]);
  forkTasks.push([
    workflow.workflowDefinition.tasks[3],
    workflow.workflowDefinition.tasks[4],
  ]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(
    0,
    1,
  );

  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"],
  });
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}

export function dagStaticForkFailure() {
  const workflow = new WorkflowExecution("test_workflow", "FAILED");
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: [],
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig)
    .forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([
    workflow.workflowDefinition.tasks[1],
    workflow.workflowDefinition.tasks[2],
  ]);
  forkTasks.push([
    workflow.workflowDefinition.tasks[3],
    workflow.workflowDefinition.tasks[4],
  ]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(
    0,
    1,
  );

  // Fail one of the branches.
  (
    workflow.tasks.find(
      (task) => task.referenceTaskName === "static_fork_task_2",
    ) as TaskResult
  ).status = "FAILED";
  workflow.tasks = workflow.tasks.filter(
    (task) => task.referenceTaskName !== "static_fork_task_3",
  );

  workflow.pushTask(
    "static_join",
    "JOIN",
    {
      joinOn: ["static_fork_task_1", "static_fork_task_3"],
    },
    "FAILED",
  );

  const executionAndTasks = workflow.toJSON();

  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}

export function dagStaticForkRetries() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: [],
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig)
    .forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([
    workflow.workflowDefinition.tasks[1],
    workflow.workflowDefinition.tasks[2],
  ]);
  forkTasks.push([
    workflow.workflowDefinition.tasks[3],
    workflow.workflowDefinition.tasks[4],
  ]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(
    0,
    1,
  );

  // Retry static_fork_task_3.
  const taskToRetry = workflow.tasks[4];
  taskToRetry.status = "FAILED";
  workflow.tasks.splice(5, 0, {
    ...taskToRetry,
    taskId: uuidv4(),
    status: "COMPLETED",
  });

  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"],
  });
  return WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
}
