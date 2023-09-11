import "mocha";

import { NodeData } from "./WorkflowDAG";
import { TaskResult } from "../../types/execution";
import assert from "assert";
import {
  dagSimpleUnexecuted,
  dagSimpleSuccess,
  dagSimpleFailure,
  dagSimpleRetries,
  dagSimpleDefOnly,
  dagSimpleChain,
} from "../../utils/test/dagSimple";
import {
  dagStaticForkSuccess,
  dagStaticForkFailure,
  dagStaticForkRetries,
  dagStaticForkDefOnly,
} from "../../utils/test/dagStaticFork";
import {
  dagDynamicForkNoneSpawned,
  dagDynamicForkSuccess,
  dagDynamicForkFailure,
  dagDynamicForkRetries,
  dagDynamicForkDefOnly,
} from "../../utils/test/dagDynamicFork";
import {
  dagDoWhileDefOnly,
  dagDoWhileSuccess,
  dagDoWhileFailure,
  dagDoWhileRetries,
} from "../../utils/test/dagDoWhile";
import {
  dagSwitchDefOnly,
  dagSwitchDefaultCaseNoTaskNotTaken,
  dagSwitchDefaultCaseNoTaskTaken,
  dagSwitchDoWhileDefOnly,
  dagSwitchSuccess,
} from "../../utils/test/dagSwitch";

const FANOUT_HIGH = 5,
  FANOUT_LOW = 2;

describe("Simple Task", () => {
  describe("Success", () => {
    const dag = dagSimpleSuccess();

    it("Start node present and marked COMPLETED.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    it("SIMPLE task to follow start and marked COMPLETED.", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["simple_task"]);
      assert.equal(dag.graph.node("simple_task").status, "COMPLETED");
    });

    it("Final node present and marked COMPLETED.", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.deepEqual(simple_task_successors, ["__final"]);
      assert.equal((dag.graph.successors("__final") as string[])?.length, 0);
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Chain of tasks", () => {
    const dag = dagSimpleChain();

    it("SIMPLE task to follow __start.", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["simple_task1"]);
    });

    it("Tasks 1 to 2.", () => {
      const simple_task1_successors = dag.graph.successors("simple_task1");
      assert.deepEqual(simple_task1_successors, ["simple_task2"]);
    });

    it("Tasks 2 to 3.", () => {
      const simple_task1_successors = dag.graph.successors("simple_task2");
      assert.deepEqual(simple_task1_successors, ["simple_task3"]);
    });

    it("Final node present and has only 1 predeessor", () => {
      const simple_task_successors = dag.graph.successors("simple_task3");
      assert.deepEqual(simple_task_successors, ["__final"]);

      const final_predecessors = dag.graph.predecessors("__final");
      assert.deepEqual(final_predecessors, ["simple_task3"]);
      assert.equal((dag.graph.successors("__final") as string[])?.length, 0);
    });
  });

  describe("Failure", () => {
    const dag = dagSimpleFailure();

    it("Start node present and marked COMPLETED.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    it("SIMPLE task to follow start and marked FAILED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["simple_task"]);
      assert.equal(dag.graph.node("simple_task").status, "FAILED");
    });

    it("Final node present but not executed.", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.deepEqual(simple_task_successors, ["__final"]);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Retries", () => {
    const dag = dagSimpleRetries();

    const simple_task_node = dag.graph.node("simple_task");

    it("Start node present and marked COMPLETED.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    it("SIMPLE task to follow start and be marked COMPLETED", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["simple_task"]);

      assert.equal(simple_task_node.status, "COMPLETED");
      assert.equal(simple_task_node.taskResults.length, 3);
    });

    it("Helpers are returning the last (successful) retry;", () => {
      const lastTaskId = simple_task_node.taskResults[2].taskId;
      assert.equal(
        (dag.getTaskResultByRef("simple_task") as TaskResult).taskId,
        lastTaskId,
      );
      assert.equal(
        (dag.getTaskResultByCoord({ ref: "simple_task" }) as TaskResult).taskId,
        lastTaskId,
      );
    });

    it("Final node present and COMPLETED.", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.deepEqual(simple_task_successors, ["__final"]);
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Unexecuted", () => {
    const dag = dagSimpleUnexecuted();

    it("Start node present and COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
    });

    it("SIMPLE task to follow start and unexecuted", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["simple_task"]);
      assert.equal(dag.graph.node("simple_task").status, undefined);
    });

    it("Final node present and unexecuted", () => {
      const simple_task_successors = dag.graph.successors("simple_task");
      assert.deepEqual(simple_task_successors, ["__final"]);
      assert.equal((dag.graph.successors("__final") as string[])?.length, 0);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Definition Only", () => {
    const dag = dagSimpleDefOnly();

    it("All nodes are unexecuted", () => {
      assert.equal(dag.graph.node("__start").status, undefined);
      assert.equal(dag.graph.node("simple_task").status, undefined);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });
});
describe("Dynamic Fork", () => {
  describe("Low fanout - success", () => {
    const dag = dagDynamicForkSuccess(FANOUT_LOW);

    it("FORK_JOIN_DYNAMIC follows start", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["dynamic_fork"]);
    });

    it("Forked children displayed separately", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.deepEqual(dynamic_fork_successors, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
      ]);
    });

    it("JOIN follows children", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
      ]);
    });

    it("Final node present", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.deepEqual(fork_join_successors, ["__final"]);
    });

    it("All nodes are COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_0").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_1").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Low fanout - failure", () => {
    const dag = dagDynamicForkFailure(FANOUT_LOW);

    it("FORK_JOIN_DYNAMIC follows start", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["dynamic_fork"]);
    });

    it("Children separately displayed", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.deepEqual(dynamic_fork_successors, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
      ]);
    });

    it("JOIN follows both children", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
      ]);
    });

    it("Final node present", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.deepEqual(fork_join_successors, ["__final"]);
    });

    it("Status as expected. DYNAMIC_FORK succeeds even if child fails.", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_0").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_1").status, "FAILED");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "FAILED");
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Low fanout - retries", () => {
    const dag = dagDynamicForkRetries(2);

    it("FORK_JOIN_DYNAMIC follows start", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["dynamic_fork"]);
    });

    it("2 Children", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.deepEqual(dynamic_fork_successors, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
      ]);
    });

    it("Retry history is accessible", () => {
      const failedRetryResult = dag.getTaskResultsByRef(
        "dynamic_fork_child_1",
      )?.[0];
      assert.equal(failedRetryResult?.status, "FAILED");
    });

    it("JOIN follows both children", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
      ]);
    });
    it("Final node present", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.deepEqual(fork_join_successors, ["__final"]);
    });

    it("All nodes COMPLETED. Retry does not result in failure of placeholder", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_0").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_child_1").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("High fanout - success", () => {
    const dag = dagDynamicForkSuccess(FANOUT_HIGH);

    const placeholder_node = dag.graph.node(
      "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
    );

    it("FORK_JOIN_DYNAMIC follows start", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["dynamic_fork"]);
    });

    it("Expect Collapsed cards", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.deepEqual(dynamic_fork_successors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
      assert.equal(dag.graph.node("dynamic_fork_child_0"), undefined);
    });

    it("Placeholder has no taskResults", () => {
      assert.deepEqual(placeholder_node.taskResults, []);
    });

    it("Tally should match fanout", () => {
      assert.equal(placeholder_node.tally.total, FANOUT_HIGH);
      assert.equal(placeholder_node.tally.success, FANOUT_HIGH);
    });

    it("ForkedTaskRefs match fanout", () => {
      assert.deepEqual(placeholder_node.containsTaskRefs, [
        "dynamic_fork_child_0",
        "dynamic_fork_child_1",
        "dynamic_fork_child_2",
        "dynamic_fork_child_3",
        "dynamic_fork_child_4",
      ]);
    });

    it("Forked task results can be retrieved", () => {
      const childResult = dag.getTaskResultByRef("dynamic_fork_child_0");
      assert.equal(childResult?.status, "COMPLETED");
    });

    it("Forked task config is partially reconstructed", () => {
      const childConfig = dag.getTaskConfigByCoord({
        ref: "dynamic_fork_child_0",
      });
      assert.equal(childConfig?.taskReferenceName, "dynamic_fork_child_0");
      assert.equal(childConfig?.type, undefined);
    });

    it("JOIN is connected", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("All nodes COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(
        dag.graph.node("dynamic_fork_DF_CHILDREN_PLACEHOLDER").status,
        "COMPLETED",
      );
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("High fanout - failure", () => {
    const dag = dagDynamicForkFailure(FANOUT_HIGH);
    const placeholder_node = dag.graph.node(
      "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
    );

    it("FORK_JOIN_DYNAMIC follows start", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["dynamic_fork"]);
    });

    it("Placeholder has no taskResults", () => {
      assert.deepEqual(placeholder_node.taskResults, []);
    });

    it("Tally should indicate failure", () => {
      assert.equal(placeholder_node.tally.total, FANOUT_HIGH);
      assert.equal(placeholder_node.tally.success, FANOUT_HIGH - 1);
    });

    it("forkedTaskRef size should match fanout", () => {
      assert.equal(placeholder_node.containsTaskRefs.length, FANOUT_HIGH);
    });

    it("Forked task results can be retrieved", () => {
      const childResult = dag.getTaskResultByRef("dynamic_fork_child_4");
      assert.equal(childResult?.status, "FAILED");
    });

    it("Forked task config is partially reconstructed", () => {
      const childConfig = dag.getTaskConfigByCoord({
        ref: "dynamic_fork_child_4",
      });
      assert.equal(childConfig?.taskReferenceName, "dynamic_fork_child_4");
      assert.equal(childConfig?.type, undefined);
    });

    it("JOIN is FAILED", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("All node status as expected", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(
        dag.graph.node("dynamic_fork_DF_CHILDREN_PLACEHOLDER").status,
        "FAILED",
      );
      assert.equal(dag.graph.node("dynamic_fork_join").status, "FAILED");
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("High fanout - retries", () => {
    const dag = dagDynamicForkRetries(FANOUT_HIGH);
    const placeholder_node = dag.graph.node(
      "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
    );

    it("Placeholder has no taskResults", () => {
      assert.deepEqual(placeholder_node.taskResults, []);
    });

    it("Tally - is (5/5). Retried task should not count as failure", () => {
      assert.equal(placeholder_node.tally.total, FANOUT_HIGH);
      assert.equal(placeholder_node.tally.success, FANOUT_HIGH);
    });

    it("forkedTasksRefs - dupe is removed", () => {
      assert.equal(placeholder_node.containsTaskRefs.length, 5);
    });

    it("Retry history can be retrieved", () => {
      const childResult = dag.getTaskResultByRef("dynamic_fork_child_4");
      assert.equal(childResult?.status, "COMPLETED");

      const failedRetryResult = dag.getTaskResultsByRef(
        "dynamic_fork_child_4",
      )?.[0];
      assert.equal(failedRetryResult?.status, "FAILED");
    });

    it("Forked task config is partially reconstructed", () => {
      const childConfig = dag.getTaskConfigByCoord({
        ref: "dynamic_fork_child_4",
      });
      assert.equal(childConfig?.taskReferenceName, "dynamic_fork_child_4");
      assert.equal(childConfig?.type, undefined);
    });

    it("JOIN is correctly attached and COMPLETED", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
    });

    it("All node status as expected", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(
        dag.graph.node("dynamic_fork_DF_CHILDREN_PLACEHOLDER").status,
        "COMPLETED",
      );
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });
  describe("Definition Only", () => {
    const dag = dagDynamicForkDefOnly();
    const placeholder_node: NodeData = dag.graph.node(
      "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
    );

    it("Placeholder follows FORK_JOIN_DYNAMIC", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.deepEqual(dynamic_fork_successors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("Placeholder has no attached containedTaskRefs, tally or taskResults", () => {
      assert.equal(placeholder_node.containsTaskRefs, undefined);
      assert.equal(placeholder_node.tally, undefined);
      assert.deepEqual(placeholder_node.taskResults, []);
    });

    it("Placeholder links to placeholder task config", () => {
      assert.equal(
        placeholder_node.taskConfig?.type,
        "DF_CHILDREN_PLACEHOLDER",
      );
    });

    it("JOIN follows placeholder", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("All nodes are not executed", () => {
      assert.equal(dag.graph.node("__start").status, undefined);
      assert.equal(dag.graph.node("dynamic_fork").status, undefined);
      assert.equal(placeholder_node.status, undefined);
      assert.equal(dag.graph.node("dynamic_fork_join").status, undefined);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("None Spawned", () => {
    const dag = dagDynamicForkNoneSpawned();
    const placeholder_node: NodeData = dag.graph.node(
      "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
    );

    it("FORK_JOIN_DYNAMIC follows start", () => {
      const start_successors = dag.graph.successors("__start");
      assert.deepEqual(start_successors, ["dynamic_fork"]);
    });

    it("Placeholder follows FORK_JOIN_DYNAMIC", () => {
      const dynamic_fork_successors = dag.graph.successors("dynamic_fork");
      assert.deepEqual(dynamic_fork_successors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("Placeholder has zero (not undefined) containedTaskRefs, tally. taskResults should be empty.", () => {
      assert.deepEqual(placeholder_node.containsTaskRefs, []);
      assert.equal(placeholder_node.tally?.total, 0);
      assert.equal(placeholder_node.tally?.success, 0);
      assert.deepEqual(placeholder_node.taskResults, []);
    });

    it("Placeholder links to placeholder task config", () => {
      assert.equal(
        placeholder_node.taskConfig?.type,
        "DF_CHILDREN_PLACEHOLDER",
      );
    });

    it("JOIN connected", () => {
      const fork_join_predecessors =
        dag.graph.predecessors("dynamic_fork_join");
      assert.deepEqual(fork_join_predecessors, [
        "dynamic_fork_DF_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("Final node present and follows JOIN.", () => {
      const fork_join_successors = dag.graph.successors("dynamic_fork_join");
      assert.deepEqual(fork_join_successors, ["__final"]);
    });

    it("All nodes are COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork").status, "COMPLETED");
      assert.equal(placeholder_node.status, "COMPLETED");
      assert.equal(dag.graph.node("dynamic_fork_join").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });
});

describe("Static Fork", () => {
  describe("Definition Only", () => {
    const dag = dagStaticForkDefOnly();

    it("All nodes are marked unexecuted", () => {
      assert.equal(dag.graph.node("__start").status, undefined);
      assert.equal(dag.graph.node("static_fork").status, undefined);
      assert.equal(dag.graph.node("static_fork_task_0").status, undefined);
      assert.equal(dag.graph.node("static_fork_task_1").status, undefined);
      assert.equal(dag.graph.node("static_fork_task_2").status, undefined);
      assert.equal(dag.graph.node("static_fork_task_3").status, undefined);
      assert.equal(dag.graph.node("static_join").status, undefined);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Success", () => {
    const dag = dagStaticForkSuccess();

    it("FORK has 2 successor chains", () => {
      const forkSuccessors = dag.graph.successors("static_fork");
      assert.deepEqual(forkSuccessors, [
        "static_fork_task_0",
        "static_fork_task_2",
      ]);
    });

    it("Chains are connected", () => {
      assert.deepEqual(dag.graph.successors("static_fork_task_0"), [
        "static_fork_task_1",
      ]);
      assert.deepEqual(dag.graph.successors("static_fork_task_2"), [
        "static_fork_task_3",
      ]);
    });

    it("Chains merge into JOIN", () => {
      const joinPredecessors = dag.graph.predecessors("static_join");
      assert.deepEqual(joinPredecessors, [
        "static_fork_task_1",
        "static_fork_task_3",
      ]);
    });

    it("All nodes are marked COMPLETED", () => {
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

    it("Node statuses as expected", () => {
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

    it("FORK has 2 successor chains", () => {
      const forkSuccessors = dag.graph.successors("static_fork");
      assert.deepEqual(forkSuccessors, [
        "static_fork_task_0",
        "static_fork_task_2",
      ]);
    });

    it("Chains are connected", () => {
      assert.deepEqual(dag.graph.successors("static_fork_task_0"), [
        "static_fork_task_1",
      ]);
      assert.deepEqual(dag.graph.successors("static_fork_task_2"), [
        "static_fork_task_3",
      ]);
    });

    it("Retry history can be retrieved", () => {
      const taskResults = dag.getTaskResultsByRef("x");
      assert.equal(taskResults?.[0].status, "FAILED");
      assert.equal(taskResults?.[1].status, "COMPLETED");
    });

    it("Chains merge into JOIN", () => {
      const joinPredecessors = dag.graph.predecessors("static_join");
      assert.deepEqual(joinPredecessors, [
        "static_fork_task_1",
        "static_fork_task_3",
      ]);
    });

    it("All nodes are marked COMPLETED", () => {
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
  describe("Definition Only", () => {
    const dag = dagDoWhileDefOnly();

    it("DO_WHILE follows __start", () => {
      assert.deepEqual(dag.graph.successors("__start"), ["loop_task"]);
    });

    it("Loop implemention follows DO_WHILE", () => {
      assert.deepEqual(dag.graph.successors("loop_task"), ["loop_task_child0"]);
    });

    it("Implementation expanded explicitly", () => {
      assert.deepEqual(dag.graph.successors("loop_task_child0"), [
        "loop_task_child1",
      ]);
    });

    it("End Bar follows implementation", () => {
      assert.deepEqual(dag.graph.successors("loop_task_child1"), [
        "loop_task-END",
      ]);
    });

    it("End Bar has alias to DO_WHILE", () => {
      assert.equal(
        dag.getTaskConfigByRef("loop_task-END").aliasForRef,
        "loop_task",
      );
    });

    it("End Bar is followed by __final", () => {
      assert.deepEqual(dag.graph.predecessors("__final"), ["loop_task-END"]);
    });

    it("All nodes are not executed", () => {
      assert.equal(dag.graph.node("__start").status, undefined);
      assert.equal(dag.graph.node("loop_task").status, undefined);
      assert.equal(dag.graph.node("loop_task_child0").status, undefined);
      assert.equal(dag.graph.node("loop_task_child1").status, undefined);
      assert.equal(dag.graph.node("loop_task-END").status, undefined);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Success", () => {
    const ITERATIONS = 2;
    const dag = dagDoWhileSuccess(ITERATIONS);

    const placeholder_node: NodeData = dag.graph.node(
      "loop_task_LOOP_CHILDREN_PLACEHOLDER",
    );

    it("DO_WHILE follows __start", () => {
      assert.deepEqual(dag.graph.successors("__start"), ["loop_task"]);
    });

    it("Placeholder follows DO_WHILE", () => {
      assert.equal((dag.graph.successors("loop_task") as string[])?.length, 1);
      assert.deepEqual(dag.graph.successors("loop_task"), [
        "loop_task_LOOP_CHILDREN_PLACEHOLDER",
      ]);
    });

    it("Placeholder Node has taskConfig", () => {
      assert.equal(
        placeholder_node.taskConfig.type,
        "LOOP_CHILDREN_PLACEHOLDER",
      );
    });

    it("Placeholder Node has no taskResults", () => {
      assert.deepEqual(placeholder_node.taskResults, []);
    });

    it("Placeholder Node has containsTaskRefs ", () => {
      assert.deepEqual(placeholder_node.containsTaskRefs, [
        "loop_task_child0",
        "loop_task_child1",
      ]);
    });

    it("Placeholder Node has correct tally ", () => {
      assert.deepEqual(placeholder_node.tally, {
        total: 4,
        success: 4,
        inProgress: 0,
        canceled: 0,
        failed: 0,
      });
    });

    it("End Bar follows placeholder", () => {
      assert.deepEqual(
        dag.graph.successors("loop_task_LOOP_CHILDREN_PLACEHOLDER"),
        ["loop_task-END"],
      );
    });

    it("End Bar has type DO_WHILE_END and has alias to DO_WHILE", () => {
      const config = dag.getTaskConfigByRef("loop_task-END");
      assert.equal(config.aliasForRef, "loop_task");
      assert.equal(config.type, "DO_WHILE_END");
    });

    it("End Bar is followed by __final", () => {
      assert.deepEqual(dag.graph.predecessors("__final"), ["loop_task-END"]);
    });

    it("Node status all COMPLETED", () => {
      assert.equal(dag.graph.node("loop_task").status, "COMPLETED");
      assert.equal(placeholder_node.status, "COMPLETED");
      assert.equal(dag.graph.node("loop_task-END").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Failure", () => {
    const ITERATIONS = 2;
    const dag = dagDoWhileFailure(ITERATIONS);
    const placeholder_node: NodeData = dag.graph.node(
      "loop_task_LOOP_CHILDREN_PLACEHOLDER",
    );

    it("Placeholder Node has correct tally ", () => {
      assert.deepEqual(placeholder_node.tally, {
        total: 4,
        success: 3,
        inProgress: 0,
        canceled: 0,
        failed: 1,
      });
    });

    it("Node status as expected", () => {
      assert.equal(dag.graph.node("loop_task").status, "FAILED");
      assert.equal(placeholder_node.status, "FAILED");
      assert.equal(dag.graph.node("loop_task-END").status, "FAILED");
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("Retries", () => {
    const ITERATIONS = 2;
    const dag = dagDoWhileRetries(ITERATIONS);
    const placeholder_node: NodeData = dag.graph.node(
      "loop_task_LOOP_CHILDREN_PLACEHOLDER",
    );

    it("Placeholder Node has correct tally. Retry does not contribute to tally.", () => {
      assert.deepEqual(placeholder_node.tally, {
        total: 5,
        success: 4,
        inProgress: 0,
        canceled: 0,
        failed: 1,
      });
    });

    it("Retry history can be retrieved", () => {
      const retried = dag.getTaskResultsByRef(`loop_task_child1`);
      assert.equal(retried?.length, 3);
      assert.equal(retried?.[0].status, "COMPLETED");
      assert.equal(retried?.[1].status, "FAILED");
      assert.equal(retried?.[2].status, "COMPLETED");
    });
  });
});

describe("Switch", () => {
  describe("Success - Default Case", () => {
    const dag = dagSwitchSuccess();

    it("SWITCH follows __start", () => {
      assert.deepEqual(dag.graph.successors("__start"), ["switch_task"]);
    });

    it("DECISION has 3 successor chains", () => {
      const forkSuccessors = dag.graph.successors("switch_task");
      assert.deepEqual(
        (forkSuccessors as string[])?.sort(),
        ["case0_0", "case1_0", "default_0"].sort(),
      );
    });

    it("Chains are connected", () => {
      assert.deepEqual(dag.graph.successors("case0_0"), ["case0_1"]);
      assert.deepEqual(dag.graph.successors("case1_0"), ["case1_1"]);
      assert.deepEqual(dag.graph.successors("default_0"), ["default_1"]);
    });

    it("Chains merge into final", () => {
      const joinPredecessors = dag.graph.predecessors("__final");
      assert.deepEqual(
        (joinPredecessors as string[])?.sort(),
        ["case0_1", "case1_1", "default_1"].sort(),
      );
    });

    it("Edges labeled with cases", () => {
      assert.equal(
        dag.graph.edge("switch_task", "default_0").caseValue,
        "default",
      );
      assert.equal(
        dag.graph.edge("switch_task", "case0_0").caseValue,
        "case_0",
      );
      assert.equal(
        dag.graph.edge("switch_task", "case1_0").caseValue,
        "case_1",
      );
    });

    it("Only default edge is marked executed", () => {
      assert.equal(dag.graph.edge("switch_task", "default_0").executed, true);
      assert.equal(dag.graph.edge("switch_task", "case0_0").executed, false);
      assert.equal(dag.graph.edge("switch_task", "case1_0").executed, false);
    });

    it("Only default tasks marked COMPLETED", () => {
      assert.equal(dag.graph.node("__start").status, "COMPLETED");
      assert.equal(dag.graph.node("switch_task").status, "COMPLETED");
      assert.equal(dag.graph.node("case0_0").status, undefined);
      assert.equal(dag.graph.node("case0_1").status, undefined);
      assert.equal(dag.graph.node("case1_0").status, undefined);
      assert.equal(dag.graph.node("case1_1").status, undefined);
      assert.equal(dag.graph.node("default_0").status, "COMPLETED");
      assert.equal(dag.graph.node("default_1").status, "COMPLETED");
      assert.equal(dag.graph.node("__final").status, "COMPLETED");
    });
  });

  describe("Success - Case 0", () => {
    const dag = dagSwitchSuccess(0);

    it("Only case 0 edge is marked executed", () => {
      assert.equal(dag.graph.edge("switch_task", "default_0").executed, false);
      assert.equal(dag.graph.edge("switch_task", "case0_0").executed, true);
      assert.equal(dag.graph.edge("switch_task", "case1_0").executed, false);
    });
  });

  describe("SWITCH - Empty default case taken", () => {
    const dag = dagSwitchDefaultCaseNoTaskTaken();

    it("Should have edge from SWITCH to case0_0 and __final", () => {
      const final_predecessors = dag.graph.successors("switch_task");
      assert.deepEqual(final_predecessors, ["case0_0", "__final"]);
    });

    it("Default edge is labeled", () => {
      assert.equal(
        dag.graph.edge("switch_task", "__final").caseValue,
        "default",
      );
    });

    it("Case 0 edge is labeled", () => {
      assert.equal(
        dag.graph.edge("switch_task", "case0_0").caseValue,
        "case_0",
      );
    });

    it("Should mark default edge as executed", () => {
      assert.equal(dag.graph.edge("switch_task", "__final").executed, true);
    });

    it("Should mark case edge as unexecuted", () => {
      assert.equal(dag.graph.edge("switch_task", "case0_0").executed, false);
    });
  });

  describe("SWITCH - Empty default case not taken", () => {
    const dag = dagSwitchDefaultCaseNoTaskNotTaken();

    it("Should mark default edge as unexecuted", () => {
      assert.equal(dag.graph.edge("switch_task", "__final").executed, false);
    });
    it("Should mark case edge as executed", () => {
      assert.equal(dag.graph.edge("switch_task", "case0_0").executed, true);
    });
    it("Should mark case 0 to final edge as executed", () => {
      assert.equal(dag.graph.edge("case0_0", "__final").executed, true);
    });
  });

  describe("Definition Only", () => {
    const dag = dagSwitchDefOnly();

    it("All nodes are not executed", () => {
      assert.equal(dag.graph.node("__start").status, undefined);
      assert.equal(dag.graph.node("switch_task").status, undefined);
      assert.equal(dag.graph.node("case0_0").status, undefined);
      assert.equal(dag.graph.node("case0_1").status, undefined);
      assert.equal(dag.graph.node("case1_0").status, undefined);
      assert.equal(dag.graph.node("case1_1").status, undefined);
      assert.equal(dag.graph.node("default_0").status, undefined);
      assert.equal(dag.graph.node("default_1").status, undefined);
      assert.equal(dag.graph.node("__final").status, undefined);
    });
  });

  describe("SWITCH inside loop - Definition Only", () => {
    const dag = dagSwitchDoWhileDefOnly();

    it("All 3 branches point to DO_WHILE_END", () => {
      assert.deepEqual(
        (dag.graph.predecessors("do_while-END") as string[])?.sort(),
        ["case0_1", "case1_1", "default_1"].sort(),
      );
    });
  });
});
