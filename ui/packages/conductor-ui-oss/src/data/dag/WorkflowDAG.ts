import _ from "lodash";
import { graphlib, Node } from "dagre-cluster-fix";
import { templates } from "./templates";
import {
  WorkflowDef,
  GenericTaskConfig,
  Tally,
  SwitchTaskConfig,
  DynamicForkTaskConfig,
  DoWhileTaskConfig,
  EndDoWhileTaskConfig,
  ForkTaskConfig,
  JoinTaskConfig,
  TaskCoordinate,
  IncompleteDFChildTaskConfig,
  TaskCoordinateRef,
  PlaceholderTaskConfig,
  TaskConfigType,
  TaskConfig,
  StartTaskConfig,
  FinalTaskConfig,
} from "../../types/workflowDef";
import {
  ForkTaskResult,
  TaskResult,
  ExecutionAndTasks,
  TaskStatus,
  Execution,
  SwitchTaskResult,
  DoWhileTaskResult,
} from "../../types/execution";
const DYNAMIC_FORK_COLLAPSE_LIMIT = 3;

export type NodeData = {
  id: string;
  taskConfig: GenericTaskConfig;
  parentArray: GenericTaskConfig[];
  taskResults: TaskResult[];

  status?: TaskStatus;
  tally?: Tally;
  containsTaskRefs?: string[];
  loopParentRef?: string;
};

export type NodeWithData = Node<NodeData>;

export default class WorkflowDAG {
  workflowDef: Omit<WorkflowDef, "tasks">;
  taskConfigs: TaskConfig[];

  graph: graphlib.Graph<NodeData>;
  taskResultsByRef: Map<string, TaskResult[]>;
  taskResultById: Map<string, TaskResult>;

  execution?: Execution;

  private constructor(workflowDef: WorkflowDef) {
    this.workflowDef = _.omit(workflowDef, "tasks");
    this.taskConfigs = _.cloneDeep(workflowDef.tasks);
    // OK to mutate - taskConfigs appended with reconstructed configs from dynamically forked tasks.

    // Following will always be populated by initialize()
    this.graph = undefined as unknown as graphlib.Graph<NodeData>;
    this.taskResultsByRef = new Map() as Map<string, TaskResult[]>;
    this.taskResultById = new Map() as Map<string, TaskResult>;
  }

  public clone() {
    const newDag = new WorkflowDAG(this.toWorkflowDef());
    newDag.initialize();
    return newDag;
  }

  public toWorkflowDef(): WorkflowDef {
    return {
      ...this.workflowDef,
      tasks: this.taskConfigs,
    };
  }

  public static fromWorkflowDef(workflowDef: WorkflowDef) {
    const cls = new WorkflowDAG(workflowDef);
    cls.initialize();
    return cls;
  }

  public static fromExecutionAndTasks(executionAndTasks: ExecutionAndTasks) {
    const { execution, tasks } = executionAndTasks;
    const cls = new WorkflowDAG(execution!.workflowDefinition);
    let isTerminated = false;
    cls.execution = execution;

    // Load all task results into Ref and Id keyed maps
    for (let task of tasks!) {
      if (task.taskType === "TERMINATE") {
        isTerminated = true;
      }

      cls.addTaskResult({ ...task });
    }

    // Pass 2 - Retrofit Dynamic Forks with forkedTaskRefs and SWITCH with executedCaseRef
    for (const taskResult of tasks!) {
      if (taskResult.parentTaskReferenceName) {
        const parentResult = cls.getTaskResultByRef(
          taskResult.parentTaskReferenceName,
        );

        if (!parentResult)
          throw new Error(
            "Invalid state - parentTaskReferenceName not found: " +
              taskResult.parentTaskReferenceName,
          );

        if (
          parentResult.taskType === "FORK_JOIN_DYNAMIC" ||
          parentResult.taskType === "FORK" ||
          parentResult.taskType === "FORK_JOIN"
        ) {
          if (taskResult.taskType !== "JOIN") {
            const forkResult = parentResult as ForkTaskResult;
            if (!forkResult.forkedTaskRefs) {
              forkResult.forkedTaskRefs = new Set(); // Need to use a set due to potential dups from retries.
            }
            forkResult.forkedTaskRefs!.add(taskResult.referenceTaskName);
          }
        } else if (
          parentResult.taskType === "SWITCH" ||
          parentResult.taskType === "DECISION"
        ) {
          const switchResult = parentResult as SwitchTaskResult;
          if (switchResult.executedCaseRef) {
            //console.log("executedCaseRef already set. Assume this is a task further down the chain in a case array:", taskResult.referenceTaskName)
          } else {
            switchResult.executedCaseRef = taskResult.referenceTaskName;
          }
        } else if (parentResult.taskType === "DO_WHILE") {
          const doWhileResult = parentResult as DoWhileTaskResult;
          if (!doWhileResult.loopTaskIds) {
            doWhileResult.loopTaskIds = [];
          }
          doWhileResult.loopTaskIds.push(taskResult.taskId);
        }
      }
    }

    // Always add start bubble, and mark it as executed.
    cls.addTaskResult({
      referenceTaskName: "__start",
      taskType: "START",
      status: "COMPLETED",
      taskId: "",
      taskDefName: "",
      workflowInstanceId: "",
      startTime: 0,
      endTime: 0,
    });

    if (execution!.status === "COMPLETED" && !isTerminated) {
      cls.addTaskResult({
        referenceTaskName: "__final",
        taskType: "FINAL",
        status: "COMPLETED",
        taskId: "",
        taskDefName: "",
        workflowInstanceId: "",
        startTime: 0,
        endTime: 0,
      });
    }

    cls.initialize();

    return cls;
  }

  node(ref: string) {
    return this.graph.node(ref) as NodeWithData;
  }

  addTaskResult(task: TaskResult) {
    if (!this.taskResultsByRef.has(task.referenceTaskName)) {
      this.taskResultsByRef.set(task.referenceTaskName, []);
    }

    // Cannot be undefined since we just pushed an empty array.
    (this.taskResultsByRef.get(task.referenceTaskName) as TaskResult[]).push(
      task,
    );

    // Terminal and Placeholder pseudotasks do not have IDs
    if (task.taskType !== "START" || task.taskType !== "FINAL") {
      this.taskResultById.set((task as TaskResult).taskId, task);
    }
  }

  initialize() {
    this.graph = new graphlib.Graph({ directed: true, compound: false });

    const startTask: StartTaskConfig = {
      type: "START",
      taskReferenceName: "__start",
      name: "start",
    };

    let currAntecedents = this.processTask(
      startTask,
      [],
      this.taskConfigs,
      undefined,
    );

    for (const task of this.taskConfigs) {
      currAntecedents = this.processTask(
        task,
        currAntecedents,
        this.taskConfigs,
        undefined,
      );
    }

    // Add completed bubble for all workflows.
    const endTask: FinalTaskConfig = {
      type: "FINAL",
      taskReferenceName: "__final",
      name: "final",
    };
    this.processTask(endTask, currAntecedents, this.taskConfigs, undefined);

    // Cleanup - All branches are terminated by a user-defined 'TERMINATE' task.
    if (_.isEmpty(this.graph.inEdges("__final"))) {
      this.graph.removeNode("__final");
    }
  }

  getTaskConfigExecutionStatus(taskConfig: GenericTaskConfig) {
    const taskResult = this.getTaskResultByRef(
      taskConfig.aliasForRef || taskConfig.taskReferenceName,
    );
    return taskResult?.status;
  }

  addVertex(
    taskConfig: GenericTaskConfig,
    antecedentConfigs: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    overrides: {
      status?: TaskStatus;
      tally?: Tally;
      containsTaskRefs?: string[];
      loopParentRef?: string;
    },
  ) {
    const effectiveRef = taskConfig.aliasForRef || taskConfig.taskReferenceName;
    const taskResult = _.last(this.taskResultsByRef.get(effectiveRef)); //undefined if unexecuted

    let vertex: NodeData = {
      id: taskConfig.taskReferenceName,
      parentArray: parentArray,
      taskConfig: taskConfig,
      taskResults: this.getTaskResultsByRef(effectiveRef),
    };

    if (!overrides) {
      vertex.status = taskResult?.status;
    } else {
      vertex.status = overrides.status;
      vertex.tally = overrides.tally;
      vertex.containsTaskRefs = overrides.containsTaskRefs;
      vertex.loopParentRef = overrides.loopParentRef;
    }

    this.graph.setNode(taskConfig.taskReferenceName, vertex);

    for (let antecedentConfig of antecedentConfigs) {
      const antecedentExecuted = !!(
        this.graph.node(antecedentConfig.taskReferenceName) as NodeWithData
      ).status;
      let edgeParams: any = {};

      if (antecedentConfig.type === "SWITCH") {
        // Figure out caseValue no matter what
        const caseValue = getCaseValue(
          taskConfig.taskReferenceName,
          antecedentConfig,
        );
        edgeParams.caseValue = caseValue;

        if (antecedentExecuted) {
          // Special case - When the antecedent of an executed node is a SWITCH or DECISION,
          // the edge may not necessarily be highlighted.
          //
          // No need for special case for DO_WHILE_END any more because executed loops are always collapsed.

          if (taskResult) {
            edgeParams.executed = this.isBranchTaken(
              caseValue,
              taskResult as TaskResult,
              antecedentConfig,
            );
          } else {
            edgeParams.executed = false;
          }
        } else {
          // General case - edge highlighted if task is executed.
          edgeParams.executed = !!vertex.status && antecedentExecuted;
        }
      } else {
        edgeParams.executed = !!vertex.status && antecedentExecuted;
      }

      this.graph.setEdge(
        antecedentConfig.taskReferenceName,
        taskConfig.taskReferenceName,
        edgeParams,
      );
    }
  }

  processTaskList(
    tasks: GenericTaskConfig[],
    antecedents: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ) {
    let currAntecedents = antecedents;
    for (const task of tasks) {
      currAntecedents = this.processTask(
        task,
        currAntecedents,
        tasks,
        loopParentRef,
      );
    }

    return currAntecedents;
  }

  // Nodes are connected to previous
  processSwitchTask(
    decisionTask: SwitchTaskConfig,
    antecedents: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ) {
    const retval: GenericTaskConfig[] = [];

    this.addVertex(decisionTask, antecedents, parentArray, { loopParentRef });

    if (_.isEmpty(decisionTask.defaultCase)) {
      retval.push(decisionTask); // Empty default path
    } else {
      retval.push(
        ...this.processTaskList(
          decisionTask.defaultCase,
          [decisionTask],
          loopParentRef,
        ),
      );
    }

    retval.push(
      ..._.flatten(
        Object.entries(decisionTask.decisionCases).map(([caseValue, tasks]) => {
          return this.processTaskList(tasks, [decisionTask], loopParentRef);
        }),
      ),
    );
    return retval;
  }

  processForkJoinDynamic(
    dfTask: DynamicForkTaskConfig,
    antecedents: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ) {
    // This is the DF task (dotted bar) itself.
    this.addVertex(dfTask, antecedents, parentArray, { loopParentRef });

    // Only add placeholder if there are 0 spawned tasks for this DF
    const dfTaskResult = this.getTaskResultByRef(dfTask.taskReferenceName) as
      | ForkTaskResult
      | undefined;
    const forkedTaskRefs = dfTaskResult?.forkedTaskRefs;

    if (
      !forkedTaskRefs ||
      forkedTaskRefs.size === 0 ||
      forkedTaskRefs.size >= DYNAMIC_FORK_COLLAPSE_LIMIT
    ) {
      const {
        taskConfig: placeholderTaskConfig,
        status,
        tally,
        containsTaskRefs,
      } = this.getDfPlaceholder(dfTask.taskReferenceName, forkedTaskRefs);
      this.addVertex(placeholderTaskConfig, [dfTask], parentArray, {
        status,
        tally,
        containsTaskRefs,
        loopParentRef,
      });
      return [placeholderTaskConfig];
    } else {
      let taskConfigs: TaskConfig[] = [];
      for (const taskRef of Array.from(forkedTaskRefs)) {
        const taskResult = this.getTaskResultByRef(taskRef) as TaskResult;
        const taskConfig = makeTaskConfigFromTaskResult(taskResult);
        taskConfigs.push(taskConfig);
        this.addVertex(taskConfig, [dfTask], parentArray, { loopParentRef });
      }
      return taskConfigs;
    }
  }

  processDoWhileTask(
    doWhileTaskConfig: DoWhileTaskConfig,
    antecedents: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ) {
    const doWhileTaskResult = this.getTaskResultByRef(
      doWhileTaskConfig.taskReferenceName,
    );

    this.addVertex(doWhileTaskConfig, antecedents, parentArray, {
      loopParentRef,
    });

    const loopOverRefs = doWhileTaskConfig.loopOver.map(
      (t) => t.taskReferenceName,
    );

    if (doWhileTaskResult) {
      const loopTaskResults: TaskResult[] = [];
      for (let ref of loopOverRefs) {
        const refList = this.taskResultsByRef.get(ref) || [];
        loopTaskResults.push(...refList);
      }

      // Collpase into stack, stack inherits DO_WHILE status
      const {
        taskConfig: placeholderTaskConfig,
        tally,
        containsTaskRefs,
      } = this.getDoWhilePlaceholder(
        doWhileTaskConfig.taskReferenceName,
        loopOverRefs,
      );

      this.addVertex(placeholderTaskConfig, [doWhileTaskConfig], parentArray, {
        status: doWhileTaskResult.status,
        tally,
        containsTaskRefs,
        loopParentRef,
      });

      // aliasForRef indicates when the bottom bar is clicked one we should highlight the ref
      const endDoWhileTaskConfig: EndDoWhileTaskConfig = {
        type: "DO_WHILE_END",
        name: doWhileTaskConfig.name,
        taskReferenceName: doWhileTaskConfig.taskReferenceName + "-END",
        aliasForRef: doWhileTaskConfig.taskReferenceName,
      };

      // Add bar marking End of Loop - inherit DO_WHILE status
      this.addVertex(
        endDoWhileTaskConfig,
        [placeholderTaskConfig],
        parentArray,
        {
          status: doWhileTaskResult.status,
          loopParentRef,
        },
      );
      return [endDoWhileTaskConfig];
    } else {
      // Definition view (or not executed)

      this.processTaskList(
        doWhileTaskConfig.loopOver,
        [doWhileTaskConfig],
        doWhileTaskConfig.taskReferenceName,
      );

      const lastLoopTask = _.last(doWhileTaskConfig.loopOver);
      if (!lastLoopTask) {
        return [doWhileTaskConfig];
      } else if (
        lastLoopTask?.type === "SWITCH" &&
        !(
          _.isEmpty(lastLoopTask.defaultCase) &&
          _.isEmpty(lastLoopTask.decisionCases)
        )
      ) {
        const tails = Object.entries(lastLoopTask.decisionCases).map(
          ([caseValue, tasks]) => {
            return tasks[tasks.length - 1];
          },
        );

        if (lastLoopTask.defaultCase) {
          tails.push(
            lastLoopTask.defaultCase[lastLoopTask.defaultCase.length - 1],
          );
        }
        return tails;
      } else {
        return [lastLoopTask];
      }
    }
  }

  processForkJoin(
    forkJoinTask: ForkTaskConfig,
    antecedents: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ) {
    let outerForkTasks = forkJoinTask.forkTasks;

    // Add FORK_JOIN task itself (solid bar)
    this.addVertex(forkJoinTask, antecedents, parentArray, { loopParentRef });

    // Each sublist is executed in parallel. Tasks within sublist executed sequentially
    if (!_.isEmpty(outerForkTasks)) {
      return _.flatten(
        outerForkTasks.map((innerForkTasks) =>
          this.processTaskList(innerForkTasks, [forkJoinTask], loopParentRef),
        ),
      );
    } else {
      return [forkJoinTask];
    }
  }

  // Works even for externalized because we no longer rely on reading inputData and outputData.
  processJoin(
    joinTask: JoinTaskConfig,
    antecedents: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ) {
    this.addVertex(joinTask, antecedents, parentArray, { loopParentRef });
    return [joinTask];
  }

  processTask(
    task: GenericTaskConfig,
    antecedents: GenericTaskConfig[],
    parentArray: GenericTaskConfig[],
    loopParentRef: string | undefined,
  ): GenericTaskConfig[] {
    switch (task.type) {
      case "FORK_JOIN": {
        return this.processForkJoin(
          task,
          antecedents,
          parentArray,
          loopParentRef,
        );
      }

      case "FORK_JOIN_DYNAMIC": {
        return this.processForkJoinDynamic(
          task,
          antecedents,
          parentArray,
          loopParentRef,
        );
      }

      case "DECISION": // DECISION is deprecated and will be removed in a future release
      case "SWITCH": {
        return this.processSwitchTask(
          task as unknown as SwitchTaskConfig,
          antecedents,
          parentArray,
          loopParentRef,
        );
      }

      case "TERMINATE": {
        this.addVertex(task, antecedents, parentArray, { loopParentRef });
        return [];
      }

      case "DO_WHILE": {
        return this.processDoWhileTask(
          task,
          antecedents,
          parentArray,
          loopParentRef,
        );
      }

      case "JOIN": {
        return this.processJoin(task, antecedents, parentArray, loopParentRef);
      }
      /*
      case "TERMINAL":
      case "EVENT":
      case "SUB_WORKFLOW":
      case "EXCLUSIVE_JOIN":
      */
      default: {
        this.addVertex(task, antecedents, parentArray, { loopParentRef });
        return [task];
      }
    }
  }

  getDFSiblingsByCoord(
    taskCoordinate: TaskCoordinate,
  ): TaskResult[] | undefined {
    const taskResult = this.getTaskResultByCoord(taskCoordinate);
    if (!taskResult?.parentTaskReferenceName) {
      return undefined;
    }
    const parentResult = this.getTaskResultByRef(
      taskResult.parentTaskReferenceName,
    ) as ForkTaskResult;

    // Parent not a FORK
    if (
      parentResult.taskType !== "FORK" &&
      parentResult.taskType !== "FORK_JOIN_DYNAMIC"
    ) {
      return undefined;
    }

    // Ignore JOINs
    if (taskResult.taskType === "JOIN") {
      return undefined;
    }

    if (!parentResult.forkedTaskRefs) {
      throw new Error("parent DF missing forkedTaskRefs");
    }
    return Array.from(parentResult.forkedTaskRefs).map((ref) => {
      const taskResult = this.getTaskResultByRef(ref);
      if (!taskResult) throw new Error("forkedTaskRef not found");
      return taskResult;
    });
  }

  getTaskResultById(id: string) {
    const result = this.taskResultById.get(id);

    if (!result) throw new Error("no result for task id");
    if (result.taskType === "TERMINAL")
      throw new Error("TERMINAL task should not be retrieved.");

    return result as TaskResult;
  }

  getTaskResultsByRef(ref: string) {
    return this.taskResultsByRef.get(ref) || [];
  }

  getTaskResultByRef(ref: string) {
    const retval = _.last(this.taskResultsByRef.get(ref));
    if (retval?.taskType === "TERMINAL") return undefined;

    return retval as TaskResult;
  }

  getLoopTaskSiblingsByCoord(taskCoordinate: TaskCoordinate) {
    const taskResult = this.getTaskResultByCoord(taskCoordinate);
    if (!taskResult?.parentTaskReferenceName) return undefined;

    const parentResult = this.getTaskResultByRef(
      taskResult.parentTaskReferenceName,
    );
    if (parentResult?.taskType !== "DO_WHILE") return undefined;

    const parentDoWhileResult = parentResult as DoWhileTaskResult;
    if (!parentDoWhileResult.loopTaskIds) return undefined;

    const tasks = parentDoWhileResult.loopTaskIds.map((id) =>
      this.taskResultById.get(id),
    );

    return tasks;
  }

  getNodeRefByCoord(taskCoordinate: TaskCoordinate | null) {
    if (!taskCoordinate) return undefined;

    if (taskCoordinate.ref && this.graph.hasNode(taskCoordinate.ref)) {
      return taskCoordinate.ref;
    } else {
      // Resolve Ref for ID
      const taskResult = this.getTaskResultByCoord(taskCoordinate);

      if (!taskResult) return undefined;

      // If node exists for ref (not collapsed), return its ref
      if (this.graph.hasNode(taskResult.referenceTaskName)) {
        return taskResult.referenceTaskName;
      } else if (taskResult.parentTaskReferenceName) {
        // Look for collapsed node
        const parentResult = this.getTaskResultByRef(
          taskResult.parentTaskReferenceName,
        );

        const successors = this.graph.successors(
          taskResult.parentTaskReferenceName,
        );

        if (
          parentResult?.taskType === "FORK_JOIN_DYNAMIC" ||
          parentResult?.taskType === "FORK"
        ) {
          const placeholderRef = successors?.find((successor) =>
            successor.id.includes("_DF_CHILDREN_PLACEHOLDER"),
          );
          return placeholderRef;
        } else if (parentResult?.taskType === "DO_WHILE") {
          const placeholderRef = successors?.find((successor) =>
            successor.id.includes("_LOOP_CHILDREN_PLACEHOLDER"),
          );
          return placeholderRef;
        }
        // return undefined
      }
    }
  }

  getTaskResultsByCoord(taskCoordinate: TaskCoordinate) {
    if (taskCoordinate.id) {
      const taskResult = this.getTaskResultById(taskCoordinate.id);
      if (taskResult) {
        const ref = taskResult.referenceTaskName;
        return this.taskResultsByRef.get(ref);
      }
    } else if (taskCoordinate.ref) {
      return this.taskResultsByRef.get(taskCoordinate.ref);
    } else {
      throw new Error("invalid taskCoordinate");
    }
  }

  getTaskResultByCoord(taskCoordinate: TaskCoordinate) {
    if (taskCoordinate.id) {
      return this.getTaskResultById(taskCoordinate.id);
    } else if (taskCoordinate.ref) {
      const retval = this.getTaskResultByRef(taskCoordinate.ref);

      return retval; // Possibly undefined if ref unexecuted.
    } else {
      throw new Error("invalid taskCoordinate");
    }
  }

  getTaskConfigByRef(ref: string) {
    const node = this.node(ref);
    if (node) {
      return node.taskConfig;
    } else {
      // Node not found by ref. (e.g. DF child). Return minimal TaskConfig
      const taskResult = this.getTaskResultByRef(ref);
      if (taskResult) {
        return {
          taskReferenceName: ref,
          name: (taskResult as TaskResult).taskDefName,
        } as IncompleteDFChildTaskConfig;
      } else {
        throw new Error("No taskConfig found for ref: " + ref);
      }
    }
  }

  getTaskConfigByCoord(taskCoordinate: TaskCoordinate) {
    let ref;
    if (taskCoordinate.id) {
      const taskResult = this.taskResultById.get(taskCoordinate.id);
      if (!taskResult) throw new Error("Task ID not found.");
      ref = taskResult.referenceTaskName;
    } else {
      ref = (taskCoordinate as TaskCoordinateRef).ref;
    }

    return this.getTaskConfigByRef(ref);
  }

  getDfPlaceholder(
    dfRef: string,
    forkedTaskRefs: Set<string> = new Set<string>(),
  ) {
    let tally: Tally | undefined = undefined,
      status: TaskStatus | undefined = undefined;

    const dfResult = this.getTaskResultByRef(dfRef);
    if (dfResult) {
      tally = Array.from(forkedTaskRefs)
        .map((ref) => {
          const childResult = this.getTaskResultByRef(ref);
          if (!childResult) {
            throw new Error("Invalid ref encountered.");
          }
          return childResult.status;
        })
        .reduce(
          (prev: Tally, curr) => {
            const retval: Tally = { ...prev };

            retval.total = prev.total + 1;

            if (curr === "COMPLETED") {
              retval.success = prev.success + 1;
            } else if (curr === "IN_PROGRESS" || curr === "SCHEDULED") {
              retval.inProgress = prev.inProgress + 1;
            } else if (curr === "CANCELED") {
              retval.canceled = prev.canceled + 1;
            }
            return {
              ...prev,
              ...retval,
            };
          },
          {
            success: 0,
            inProgress: 0,
            canceled: 0,
            total: 0,
            failed: 0,
          },
        );

      if (tally.success === tally.total) {
        status = "COMPLETED";
      } else if (tally.inProgress > 0) {
        status = "IN_PROGRESS";
      } else {
        status = "FAILED";
      }
    }

    const placeholderRef = dfRef + "_DF_CHILDREN_PLACEHOLDER";

    const placeholderConfig: PlaceholderTaskConfig = {
      name: placeholderRef,
      taskReferenceName: placeholderRef,
      type: "DF_CHILDREN_PLACEHOLDER",
    };

    return {
      taskConfig: placeholderConfig,
      status,
      tally,
      containsTaskRefs: status ? Array.from(forkedTaskRefs) : undefined,
    };
  }

  getDoWhilePlaceholder(
    doWhileRef: string,
    loopTaskRefs: string[] = [],
  ): {
    taskConfig: PlaceholderTaskConfig;
    tally: Tally;
    containsTaskRefs: string[];
  } {
    const tally = Array.from(loopTaskRefs)
      .map((ref) => {
        const childResults = this.getTaskResultsByRef(ref);
        if (_.isEmpty(childResults)) {
          console.log(`${ref} from loopOver has not been executed.`);
        }
        return childResults;
      })
      .flat()
      .reduce(
        (prev: Tally, curr: TaskResult) => {
          const retval: Tally = { ...prev };

          retval.total = prev.total + 1;

          if (curr.status === "COMPLETED") {
            retval.success = prev.success + 1;
          } else if (
            curr.status === "IN_PROGRESS" ||
            curr.status === "SCHEDULED"
          ) {
            retval.inProgress = prev.inProgress + 1;
          } else if (curr.status === "CANCELED") {
            retval.canceled = prev.canceled + 1;
          } else {
            retval.failed = prev.failed + 1;
          }
          return {
            ...prev,
            ...retval,
          };
        },
        {
          success: 0,
          inProgress: 0,
          canceled: 0,
          failed: 0,
          total: 0,
        },
      );

    const placeholderRef = doWhileRef + "_LOOP_CHILDREN_PLACEHOLDER";
    const doWhileTask = this.getTaskResultByRef(doWhileRef);

    const placeholderConfig: PlaceholderTaskConfig = {
      name: placeholderRef,
      taskReferenceName: placeholderRef,
      type: "LOOP_CHILDREN_PLACEHOLDER",
    };

    return {
      taskConfig: placeholderConfig,
      tally: { ...tally, iterations: doWhileTask!.iteration },
      containsTaskRefs: loopTaskRefs,
    };
  }

  getNextUntitled(type: TaskConfigType) {
    let idx = 0;
    const lowercase = type.toLowerCase();
    while (this.graph.hasNode(`${lowercase}_${idx}`)) {
      idx++;
    }

    const ref = `${lowercase}_${idx}`;

    return templates[type](ref);
  }

  updateTask(ref: string, newTaskConfig: TaskConfig) {
    const taskConfig = this.getTaskConfigByRef(ref);

    // Delete keys in taskConfig which are not present in newTaskConfig.
    Object.keys(taskConfig).forEach((key) => {
      if (!(key in newTaskConfig)) {
        delete taskConfig[key];
      }
    });

    // Replace attributes without replacing object.
    Object.entries(newTaskConfig).forEach(([key, value]) => {
      taskConfig[key] = value;
    });

    this.initialize();
  }

  insertAfter(ref: string, type: TaskConfigType) {
    let { taskConfig, parentArray } = this.graph.node(ref);

    if (ref === "__start") {
      const newTaskConfig = this.getNextUntitled(type);
      parentArray.unshift.apply(parentArray, newTaskConfig);
    } else {
      // Add after JOIN
      if (
        taskConfig.type === "FORK_JOIN_DYNAMIC" ||
        taskConfig.type === "FORK_JOIN"
      ) {
        const successors = this.graph.successors(ref);
        if (successors?.length !== 1) {
          throw new Error("Fork must be followed by Join");
        }
        const successorNode = successors[0];
        if (successorNode.taskConfig.type !== "JOIN") {
          throw new Error("Fork must be followed by Join");
        }

        taskConfig = successorNode.taskConfig;
      }
      const pos = parentArray.findIndex(
        (ele: GenericTaskConfig) => ele === taskConfig,
      );

      const newTaskConfig = this.getNextUntitled(type);
      parentArray.splice.apply(parentArray, [pos + 1, 0, ...newTaskConfig]);
    }
    this.initialize();
  }

  addForkTasks(parentRef: string, type: TaskConfigType) {
    const parentNode = this.graph.node(parentRef) as NodeWithData;
    const { taskConfig } = parentNode;
    // const parentArray: GenericTaskConfig[] = parentNode.parentArray;

    const newTaskConfig = this.getNextUntitled(type);
    (taskConfig as ForkTaskConfig).forkTasks.push(newTaskConfig);

    // Use parentArray to infer matching join
    /*
    const forkIdx = parentArray.findIndex(tc => tc.taskReferenceName === parentRef);
    if(forkIdx > -1 && (parentArray.length > forkIdx + 1) && parentArray[forkIdx + 1].type === "JOIN"){
      const joinTask = parentArray[forkIdx + 1] as JoinTaskConfig;
      if(_.isArray(joinTask.joinOn)){
        joinTask.joinOn.push(newTaskConfig[0].taskReferenceName);
      }
      else {
        joinTask.joinOn = [newTaskConfig[0].taskReferenceName];
      }
    }
    */
    this.initialize();
  }

  addSwitchCase(
    parentRef: string,
    type: TaskConfigType,
    isDefault: boolean = false,
  ) {
    const taskConfig = this.graph.node(parentRef)
      .taskConfig as SwitchTaskConfig;

    const newTaskConfig = this.getNextUntitled(type);
    if (isDefault) {
      taskConfig.defaultCase = newTaskConfig;
    } else {
      taskConfig.decisionCases[
        `case_${Object.keys(taskConfig.decisionCases).length}`
      ] = newTaskConfig;
    }
    this.initialize();
  }

  addLoopTask(parentRef: string, type: TaskConfigType) {
    const taskConfig = this.graph.node(parentRef)
      .taskConfig as DoWhileTaskConfig;

    const newTaskConfig = this.getNextUntitled(type);

    taskConfig.loopOver = [...newTaskConfig, ...taskConfig.loopOver];

    this.initialize();
  }

  deleteTask(ref: string) {
    const { taskConfig, parentArray } = this.graph.node(ref);

    const pos = parentArray.findIndex(
      (ele: GenericTaskConfig) => ele === taskConfig,
    );
    if (pos === -1) {
      throw new Error(
        "Invalid state. ParentArray expected to contain taskConfig",
      );
    }
    // Remove join also if needed
    if (
      taskConfig.type === "FORK_JOIN_DYNAMIC" ||
      taskConfig.type === "FORK_JOIN"
    ) {
      if (parentArray[pos + 1]?.type !== "JOIN") {
        throw new Error("Fork must be followed by Join");
      }
      parentArray.splice(pos, 2);
    } else {
      parentArray.splice(pos, 1);
    }

    if (parentArray.length === 0) {
      // If parentArray is nested inside a FORK_JOIN or DECISION - clean up
      this.cleanupTaskListParent(parentArray);
    }
    this.initialize();
  }

  cleanupTaskListParent(taskList: GenericTaskConfig[]) {
    // Using the graph ensures we find the parent even if it is deeply nested inside a FORK_JOIN or DECISION
    const nodes = this.graph.nodes();
    for (const ref of nodes) {
      const node = this.graph.node(ref);
      const taskConfig: GenericTaskConfig = node.taskConfig;
      if (taskConfig.type === "FORK_JOIN") {
        const idx = taskConfig.forkTasks.findIndex((tl) => tl === taskList);
        if (idx !== -1) {
          taskConfig.forkTasks.splice(idx, 1);
        }
      } else if (taskConfig.type === "SWITCH") {
        const matchEntry = Object.entries(taskConfig.decisionCases).find(
          ([key, tl]) => tl === taskList,
        );
        if (matchEntry) {
          delete taskConfig.decisionCases[matchEntry[0]];
        }
      }
    }
    return null;
  }

  isBranchTaken(
    caseValue: string,
    branchTaskResult: TaskResult,
    switchTaskConfig: SwitchTaskConfig,
  ) {
    let retval;
    if (caseValue === "default") {
      if (
        switchTaskConfig.defaultCase?.[0]?.taskReferenceName ===
        branchTaskResult.referenceTaskName
      ) {
        retval = true;
      } else {
        const switchTaskResult = this.getTaskResultByRef(
          switchTaskConfig.taskReferenceName,
        ) as SwitchTaskResult;
        retval = !switchTaskResult?.executedCaseRef;
        // executedCaseRef being set implies some other case was selected and thus the default case could not have been active.
      }
    } else {
      if (branchTaskResult.taskType === "TERMINAL") {
        throw new Error("Terminal task not expected here");
      }

      retval =
        (branchTaskResult as TaskResult).parentTaskReferenceName ===
        switchTaskConfig.taskReferenceName;
    }

    return retval;
  }
}
function getCaseValue(ref: string, decisionTask: SwitchTaskConfig) {
  if (decisionTask.defaultCase?.[0]?.taskReferenceName === ref) {
    return "default";
  }

  for (const [caseValue, taskList] of Object.entries(
    decisionTask.decisionCases,
  )) {
    if (!_.isEmpty(taskList) && ref === taskList[0].taskReferenceName) {
      return caseValue;
    }
  }

  if (_.isEmpty(decisionTask.defaultCase)) {
    return "default";
  }

  throw new Error("Invalid state. Could not find caseValue");
}

function makeTaskConfigFromTaskResult(task: TaskResult): TaskConfig {
  let type: TaskConfigType;
  if (task.taskType === "FORK") {
    // Legacy FORK task
    if (task.parentTaskReferenceName) {
      type = "FORK_JOIN_DYNAMIC";
    } else {
      type = "FORK_JOIN";
    }
  } else {
    type = task.taskType as TaskConfigType;
  }
  return {
    name: task.taskDefName,
    taskReferenceName: task.referenceTaskName,
    type: type,
  } as TaskConfig;
}