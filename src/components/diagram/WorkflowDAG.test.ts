import WorkflowDAG, { ForkTaskConfig, SimpleTaskConfig, TaskResult, TaskType } from "./WorkflowDAG";
import { WorkflowExecution } from "../../utils/harness";
import assert from "assert";
import { v4 as uuidv4 } from "uuid";

const FANOUT_HIGH = 5, FANOUT_LOW = 2;

describe("Simple Task", () => {
  describe("Success", () => {
    const workflow = new WorkflowExecution("test_workflow", "COMPLETED")
    workflow.pushSimple("simple_task")
    const executionAndTasks = workflow.toJSON();

    const dag = WorkflowDAG.fromExecutionAndTasks(executionAndTasks);

    test("Start node present and marked COMPLETED.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    test("SIMPLE task to follow start and marked COMPLETED.", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1)
      assert.equal(start_successors?.[0], "simple_task")
      assert.equal(dag.graph.node("simple_task").status, "COMPLETED")
    });

    test("Final node present and marked COMPLETED.", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.equal(simple_task_successors?.[0], "__final");
      assert.equal(dag.graph.successors("__final")?.length, 0)
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Failure", () => {
    const workflow = new WorkflowExecution("test_workflow", "FAILED")
    workflow.pushSimple("simple_task", "FAILED")
    const executionAndTasks = workflow.toJSON();

    const dag = WorkflowDAG.fromExecutionAndTasks(executionAndTasks);

    test("Start node present and marked COMPLETED.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    test("SIMPLE task to follow start and marked FAILED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1)
      assert.equal(start_successors?.[0], "simple_task")
      assert.equal(dag.graph.node("simple_task").status, "FAILED")
    });

    test("Final node present but not executed.", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.equal(simple_task_successors?.length, 1);
      assert.equal(simple_task_successors?.[0], "__final");
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });


  describe("Retries", () => {
    const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
    workflow.pushSimple("simple_task", "COMPLETED", 3);
    workflow.tasks[0].status = "FAILED";
    workflow.tasks[1].status = "FAILED";

    const executionAndTasks = workflow.toJSON();

    const dag = WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
    const simple_task_node = dag.graph.node("simple_task");

    test("Start node present and marked COMPLETED.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    test("SIMPLE task to follow start and be marked COMPLETED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1)
      assert.equal(start_successors?.[0], "simple_task")

      assert.equal(simple_task_node.status, "COMPLETED")
      assert.equal(simple_task_node.taskResults.length, 3);
    });

    test("Helpers are returning the last (successful) retry;", () => {
      const lastTaskId = simple_task_node.taskResults[2].taskId;
      assert.equal((dag.getTaskResultByRef("simple_task") as TaskResult).taskId, lastTaskId);
      assert.equal((dag.getTaskResultByCoord({ ref: "simple_task" }) as TaskResult).taskId, lastTaskId);
    });

    test("Final node present and COMPLETED.", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.equal(simple_task_successors?.length, 1);
      assert.equal(simple_task_successors?.[0], "__final");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });
});

describe("Dynamic Fork", () => {
  describe("Low fanout - success", () => {
    const dag = dagDynamicForkSuccess(FANOUT_LOW);

    test("FORK_JOIN_DYNAMIC is COMPLETED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1);
      assert.equal(start_successors?.[0], "dynamic_fork");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
    });

    test("Forked children displayed separately", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.equal(dynamic_fork_successors?.length, 2);
      assert.equal(dynamic_fork_successors?.[0], "dynamic_fork_child_0");
      assert.equal(dynamic_fork_successors?.[1], "dynamic_fork_child_1");
      assert.equal(dag.graph.node("dynamic_fork_child_0").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_1").status, "COMPLETED");
    });

    test("JOIN connected and COMPLETED", () => {
      const fork_join_predecessors = dag.graph.predecessors("dynamic_fork_join");
      assert.equal(fork_join_predecessors?.length, 2);
      assert.equal(fork_join_predecessors?.[0], "dynamic_fork_child_0");
      assert.equal(fork_join_predecessors?.[1], "dynamic_fork_child_1");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
    });

    test("Final node present and marked COMPLETED.", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.equal(fork_join_successors?.length, 1);
      assert.equal(fork_join_successors?.[0], "__final");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Low fanout - failure", () => {
    const dag = dagDynamicForkFailure(FANOUT_LOW);

    test("FORK_JOIN_DYNAMIC is COMPLETED even if children fail", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1);
      assert.equal(start_successors?.[0], "dynamic_fork");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
    });

    test("Children - Separate and 1 failure", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.equal(dynamic_fork_successors?.length, 2);
      assert.equal(dynamic_fork_successors?.[0], "dynamic_fork_child_0");
      assert.equal(dynamic_fork_successors?.[1], "dynamic_fork_child_1");
      assert.equal(dag.graph.node("dynamic_fork_child_0").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_1").status, "FAILED");
    });

    test("JOIN is connected and FAILED", () => {
      const fork_join_predecessors = dag.graph.predecessors("dynamic_fork_join");
      assert.equal(fork_join_predecessors?.length, 2);
      assert.equal(fork_join_predecessors?.[0], "dynamic_fork_child_0");
      assert.equal(fork_join_predecessors?.[1], "dynamic_fork_child_1");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "FAILED");
    });

    test("Final node present and not executed", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.equal(fork_join_successors?.length, 1);
      assert.equal(fork_join_successors?.[0], "__final");
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Low fanout - retries", () => {
    const dag = dagDynamicForkRetries(2);

    test("FORK_JOIN_DYNAMIC is COMPLETED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1);
      assert.equal(start_successors?.[0], "dynamic_fork");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
    });

    test("2 Children both COMPLETED", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.equal(dynamic_fork_successors?.length, 2);
      assert.equal(dynamic_fork_successors?.[0], "dynamic_fork_child_0");
      assert.equal(dynamic_fork_successors?.[1], "dynamic_fork_child_1");
      assert.equal(dag.graph.node("dynamic_fork_child_0").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_1").status, "COMPLETED");
    });
    test("Retry history is accessible", () => {
      const failedRetryResult = dag.getAllTaskResultsByRef("dynamic_fork_child_1")?.[0];
      assert.equal(failedRetryResult?.status, "FAILED");
    });
    test("JOIN is COMPLETED", () => {
      const fork_join_predecessors = dag.graph.predecessors("dynamic_fork_join");
      assert.equal(fork_join_predecessors?.length, 2);
      assert.equal(fork_join_predecessors?.[0], "dynamic_fork_child_0");
      assert.equal(fork_join_predecessors?.[1], "dynamic_fork_child_1");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
    });
    test("Final node present and marked COMPLETED.", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.equal(fork_join_successors?.length, 1);
      assert.equal(fork_join_successors?.[0], "__final");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });


  describe("High fanout - success", () => {
    const dag = dagDynamicForkSuccess(FANOUT_HIGH);

    const placeholder_node = dag.graph.node("dynamic_fork_DF_CHILDREN_PLACEHOLDER");
    const taskResult = placeholder_node.taskResults?.[0];

    test("FORK_JOIN_DYNAMIC is COMPLETED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1);
      assert.equal(start_successors?.[0], "dynamic_fork");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
    });

    test("Expect Collapsed cards", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.equal(dynamic_fork_successors?.length, 1);
      assert.equal(dynamic_fork_successors?.[0], "dynamic_fork_DF_CHILDREN_PLACEHOLDER");
    });

    test("Placeholder is marked COMPLETED", () => {
      assert.equal(placeholder_node.status, "COMPLETED");
      assert.equal(placeholder_node.taskResults?.length, 1);
    });

    test("Tally should match fanout", () => {
      assert.equal(taskResult.tally.total, FANOUT_HIGH);
      assert.equal(taskResult.tally.success, FANOUT_HIGH);
    });

    test("ForkedTaskRefs match fanout", () => {
      assert.equal(taskResult.forkedTaskRefs.size, 5);
      assert.ok(taskResult.forkedTaskRefs.has("dynamic_fork_child_0"));
      assert.ok(taskResult.forkedTaskRefs.has("dynamic_fork_child_1"));
      assert.ok(taskResult.forkedTaskRefs.has("dynamic_fork_child_2"));
      assert.ok(taskResult.forkedTaskRefs.has("dynamic_fork_child_3"));
      assert.ok(taskResult.forkedTaskRefs.has("dynamic_fork_child_4"));
    });

    test("Forked task results can be retrieved", () => {
      const childResult = dag.getTaskResultByRef("dynamic_fork_child_0")
      assert.equal(childResult?.status, "COMPLETED");
    });

    test("Forked task config is partially reconstructed", () => {
      const childConfig = dag.getTaskConfigByCoord({ ref: "dynamic_fork_child_0" });
      assert.equal(childConfig?.taskReferenceName, "dynamic_fork_child_0");
      assert.equal(childConfig?.type, undefined);
    });

    test("JOIN is connected and COMPLETED", () => {
      const fork_join_predecessors = dag.graph.predecessors("dynamic_fork_join");
      assert.equal(fork_join_predecessors?.length, 1);
      assert.equal(fork_join_predecessors?.[0], "dynamic_fork_DF_CHILDREN_PLACEHOLDER");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
    });
  });


  describe("High fanout - failure", () => {
    const dag = dagDynamicForkFailure(FANOUT_HIGH);
    const placeholder_node = dag.graph.node("dynamic_fork_DF_CHILDREN_PLACEHOLDER");
    const taskResult = placeholder_node.taskResults?.[0];

    test("FORK_JOIN_DYNAMIC marked COMPLETED even if children fail", () => {
      const start_successors = dag.graph.successors("__start");
      assert.equal(start_successors?.length, 1);
      assert.equal(start_successors?.[0], "dynamic_fork");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
    });

    test("Placeholder is marked FAILED", () => {
      assert.equal(placeholder_node.status, "FAILED");
      assert.equal(placeholder_node.taskResults?.length, 1);
    });

    test("Tally should indicate failure", () => {
      assert.equal(taskResult.tally.total, FANOUT_HIGH);
      assert.equal(taskResult.tally.success, FANOUT_HIGH - 1);
    });

    test("forkedTaskRef size should match fanout", () => {
      assert.equal(taskResult.forkedTaskRefs.size, FANOUT_HIGH);
    });

    test("Forked task results can be retrieved", () => {
      const childResult = dag.getTaskResultByRef("dynamic_fork_child_4")
      assert.equal(childResult?.status, "FAILED");
    });

    test("Forked task config is partially reconstructed", () => {
      const childConfig = dag.getTaskConfigByCoord({ ref: "dynamic_fork_child_4" });
      assert.equal(childConfig?.taskReferenceName, "dynamic_fork_child_4");
      assert.equal(childConfig?.type, undefined);
    });

    test("JOIN is FAILED", () => {
      const fork_join_predecessors = dag.graph.predecessors("dynamic_fork_join");
      assert.equal(fork_join_predecessors?.length, 1);
      assert.equal(fork_join_predecessors?.[0], "dynamic_fork_DF_CHILDREN_PLACEHOLDER");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "FAILED");
    });

    test("final bubble is unexecuted", () => {
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });


  describe("High fanout - retries", () => {
    const dag = dagDynamicForkRetries(FANOUT_HIGH);
    const placeholder_node = dag.graph.node("dynamic_fork_DF_CHILDREN_PLACEHOLDER");
    const taskResult = placeholder_node.taskResults?.[0];

    test("Placeholder is marked COMPLETED", () => {
      assert.equal(placeholder_node.status, "COMPLETED");
      assert.equal(placeholder_node.taskResults?.length, 1);
    });

    test("Tally - is (5/5). Retried task should not count as failure", () => {
      assert.equal(taskResult.tally.total, FANOUT_HIGH);
      assert.equal(taskResult.tally.success, FANOUT_HIGH);
    });

    test("forkedTasksRefs - dupe is removed", () => {
      assert.equal(taskResult.forkedTaskRefs.size, 5);
    });

    test("Retry history can be retrieved", () => {
      const childResult = dag.getTaskResultByRef("dynamic_fork_child_4")
      assert.equal(childResult?.status, "COMPLETED");

      const failedRetryResult = dag.getAllTaskResultsByRef("dynamic_fork_child_4")?.[0];
      assert.equal(failedRetryResult?.status, "FAILED");
    });

    test("Forked task config is partially reconstructed", () => {
      const childConfig = dag.getTaskConfigByCoord({ ref: "dynamic_fork_child_4" });
      assert.equal(childConfig?.taskReferenceName, "dynamic_fork_child_4");
      assert.equal(childConfig?.type, undefined);
    });

    test("JOIN is correctly attached and COMPLETED", () => {
      const fork_join_predecessors = dag.graph.predecessors("dynamic_fork_join");
      assert.equal(fork_join_predecessors?.length, 1);
      assert.equal(fork_join_predecessors?.[0], "dynamic_fork_DF_CHILDREN_PLACEHOLDER");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
    });

    test("final bubble is COMPLETED", () => {
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });
});

describe("Static Fork", () => {
  describe("Success", () => {
    const dag = dagStaticForkSuccess();

    test("FORK has 2 successor chains", () => {
      const forkSuccessors = dag.graph.successors("static_fork");
      assert.equal(forkSuccessors?.length, 2);
      assert.equal(forkSuccessors?.[0], "static_fork_task_0");
      assert.equal(forkSuccessors?.[1], "static_fork_task_2");
    });


    test("Chains are connected", () => {
      assert.equal(dag.graph.successors("static_fork_task_0")?.[0], "static_fork_task_1");
      assert.equal(dag.graph.successors("static_fork_task_2")?.[0], "static_fork_task_3");
    });

    test("Chains merge into JOIN", () => {
      const joinPredecessors = dag.graph.predecessors("static_join");
      assert.equal(joinPredecessors?.length, 2);
      assert.ok(joinPredecessors?.includes("static_fork_task_1"));
      assert.ok(joinPredecessors?.includes("static_fork_task_3"));
    });

    test("All nodes are marked COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_0").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_1").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_2").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_3").status, "COMPLETED");
      assert.equal(dag.graph.node("static_join").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Failure", () => {
    const dag = dagStaticForkFailure();

    test("Node statuses as expected", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_2").status, "FAILED");
      assert.equal(dag.graph.node("static_fork_task_3").status, undefined);
      assert.equal(dag.graph.node("static_join").status, "FAILED");
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Retries", () => {
    const dag = dagStaticForkRetries();

    test("FORK has 2 successor chains", () => {
      const forkSuccessors = dag.graph.successors("static_fork");
      assert.equal(forkSuccessors?.length, 2);
      assert.equal(forkSuccessors?.[0], "static_fork_task_0");
      assert.equal(forkSuccessors?.[1], "static_fork_task_2");
    });

    test("Chains are connected", () => {
      assert.equal(dag.graph.successors("static_fork_task_0")?.[0], "static_fork_task_1");
      assert.equal(dag.graph.successors("static_fork_task_2")?.[0], "static_fork_task_3");
    });

    test("Retry history can be retrieved", () => {
      const taskResults = dag.getAllTaskResultsByRef("static_fork_task_3");
      assert.equal(taskResults?.[0].status, "FAILED");
      assert.equal(taskResults?.[1].status, "COMPLETED");
    });

    test("Chains merge into JOIN", () => {
      const joinPredecessors = dag.graph.predecessors("static_join");
      assert.equal(joinPredecessors?.length, 2);
      assert.ok(joinPredecessors?.includes("static_fork_task_1"));
      assert.ok(joinPredecessors?.includes("static_fork_task_3"));
    });

    test("All nodes are marked COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_0").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_1").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_2").status, "COMPLETED");
      assert.equal(dag.graph.node("static_fork_task_3").status, "COMPLETED");
      assert.equal(dag.graph.node("static_join").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });
});


describe("Do-While", () => {
  describe("Success", () => {

  });

  describe("Failure", () => {

  });

  describe("Retries", () => {

  });
});


// Test DAG objects

export function dagStaticForkSuccess() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED")
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: []
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig).forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([workflow.workflowDefinition.tasks[1], workflow.workflowDefinition.tasks[2]]);
  forkTasks.push([workflow.workflowDefinition.tasks[3], workflow.workflowDefinition.tasks[4]]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(0, 1);


  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"]
  });
  const executionAndTasks = workflow.toJSON();
  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}

export function dagStaticForkFailure() {
  const workflow = new WorkflowExecution("test_workflow", "FAILED")
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: []
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig).forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([workflow.workflowDefinition.tasks[1], workflow.workflowDefinition.tasks[2]]);
  forkTasks.push([workflow.workflowDefinition.tasks[3], workflow.workflowDefinition.tasks[4]]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(0, 1);

  // Fail one of the branches.
  (workflow.tasks.find(task => task.referenceTaskName === "static_fork_task_2") as TaskResult).status = "FAILED";
  workflow.tasks = workflow.tasks.filter(task => task.referenceTaskName !== "static_fork_task_3");

  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"]
  }, "FAILED");

  const executionAndTasks = workflow.toJSON();

  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}

export function dagStaticForkRetries() {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED")
  workflow.pushTask("static_fork", "FORK_JOIN", {
    forkTasks: []
  });

  workflow.pushSimple("static_fork_task_0");
  workflow.pushSimple("static_fork_task_1");

  workflow.pushSimple("static_fork_task_2");
  workflow.pushSimple("static_fork_task_3");

  const forkTasks = (workflow.workflowDefinition.tasks[0] as ForkTaskConfig).forkTasks;
  // Move taskdefs inside static fork
  forkTasks.push([workflow.workflowDefinition.tasks[1], workflow.workflowDefinition.tasks[2]]);
  forkTasks.push([workflow.workflowDefinition.tasks[3], workflow.workflowDefinition.tasks[4]]);
  workflow.workflowDefinition.tasks = workflow.workflowDefinition.tasks.splice(0, 1);

  // Retry static_fork_task_3.
  const taskToRetry = workflow.tasks[4];
  taskToRetry.status = "FAILED";
  workflow.tasks.splice(5, 0, { ...taskToRetry, taskId: uuidv4(), status: "COMPLETED" });

  workflow.pushTask("static_join", "JOIN", {
    joinOn: ["static_fork_task_1", "static_fork_task_3"]
  });
  const executionAndTasks = workflow.toJSON();
  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}

export function dagDynamicForkSuccess(fanout: number) {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED")
  workflow.pushDynamicFork("dynamic_fork", fanout)

  const executionAndTasks = workflow.toJSON();
  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}

export function dagDynamicForkFailure(fanout: number) {
  const workflow = new WorkflowExecution("test_workflow", "FAILED")
  workflow.pushDynamicFork("dynamic_fork", fanout, fanout - 1)

  const executionAndTasks = workflow.toJSON();
  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}

export function dagDynamicForkRetries(fanout: number) {

  const workflow = new WorkflowExecution("test_workflow", "COMPLETED")
  workflow.pushDynamicFork("dynamic_fork", fanout)

  // Append extra retry to one of the forked tasks
  const taskToRetry = workflow.tasks[fanout];
  taskToRetry.status = "FAILED";
  workflow.tasks.splice(fanout + 1, 0, { ...taskToRetry, taskId: uuidv4(), status: "COMPLETED" });

  const executionAndTasks = workflow.toJSON();
  return WorkflowDAG.fromExecutionAndTasks(executionAndTasks);
}