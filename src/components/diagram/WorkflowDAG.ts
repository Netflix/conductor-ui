import _ from "lodash";
import { graphlib } from "dagre-d3";
import { ExecutionAndTasks } from "../../data/execution";

export type ExecutionStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS";
export type TaskStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS" | "CANCELED" | "SCHEDULED";

export type TaskResultType = "SIMPLE" | "TERMINATE" | "DECISION" | "SWITCH" | "FORK" | "JOIN" | "DO_WHILE" | "SUB_WORKFLOW" | "EXCLUSIVE_JOIN";

export type TaskConfigType = "SIMPLE" | "TERMINATE" | "DECISION" | "SWITCH" | "FORK_JOIN" | "FORK_JOIN_DYNAMIC" | "JOIN" | "DO_WHILE" | "SUB_WORKFLOW" | "EXCLUSIVE_JOIN";
export type VirtualTaskConfigType = "DO_WHILE_END" | "TERMINAL" | "DF_CHILDREN_PLACEHOLDER" | "LOOP_CHILDREN_PLACEHOLDER" | "UNKNOWN";
export type ExtendedTaskConfigType = TaskConfigType | VirtualTaskConfigType;
type Tally = {
  success: number;
  inProgress: number;
  canceled: number;
  total: number;
}

export type Execution = {
  workflowId: string;
  parentWorkflowId?: string;
  workflowName: string;
  status: ExecutionStatus;
  workflowDefinition: WorkflowDef;
  reasonForIncompletion?: string;
}
export type WorkflowDef = {
  tasks: TaskConfig[];
}

export type BaseTaskResult = {
  taskId: string;
  taskType: TaskResultType;
  referenceTaskName: string;
  taskDefName: string;
  status: TaskStatus;
  parentTaskReferenceName?: string;
  retryCount?: number;
}
export type TaskResult = BaseTaskResult | DynamicForkTaskResult;

type TerminalTaskResult = {
  referenceTaskName: string;
  taskType: "TERMINAL";
  status: TaskStatus;
}
export interface DynamicForkTaskResult extends BaseTaskResult {
  taskType: "FORK",
  forkedTaskRefs: Set<string>;
}


type ExtendedTaskResult = TaskResult | TerminalTaskResult;


type TaskCoordinateId = { id: string, ref?: string };
type TaskCoordinateRef = { id?: string, ref: string };
export type TaskCoordinate = TaskCoordinateId | TaskCoordinateRef;

export type NodeData = {
  taskConfig: GenericTaskConfig;

  taskResults: ExtendedTaskResult[];  
  status?: TaskStatus;
  
  tally?: Tally;
  containsTaskRefs?: string[];
}

export type DagEdgeProperties = {
  caseValue?: string;
  executed: boolean;
}

type BaseTaskConfig = {
  taskReferenceName: string;
  type: ExtendedTaskConfigType;
  name: string;

  aliasForRef?: string;
  
}

// Custom Task Config Types
export interface SwitchTaskConfig extends BaseTaskConfig {
  type: "DECISION" | "SWITCH";
  defaultCase: GenericTaskConfig[];
  evaluatorType: string;
  expression: string;  
  decisionCases: { [key: string]: GenericTaskConfig[] };
}
export interface ForkTaskConfig extends BaseTaskConfig {
  type: "FORK_JOIN";
  forkTasks: GenericTaskConfig[][];
}
export interface DynamicForkTaskConfig extends BaseTaskConfig {
  type: "FORK_JOIN_DYNAMIC";
  dynamicForkTasksParam?: string;
}
export interface JoinTaskConfig extends BaseTaskConfig {
  type: "JOIN";
  joinOn?: string[];
}
export interface TerminateTaskConfig extends BaseTaskConfig {
  type: "TERMINATE";
}
export interface DoWhileTaskConfig extends BaseTaskConfig {
  type: "DO_WHILE";
  loopOver: TaskConfig[];
}
export interface EndDoWhileTaskConfig extends BaseTaskConfig {
  type: "DO_WHILE_END";
}
export interface TerminalTaskConfig extends BaseTaskConfig {
  type: "TERMINAL";
}
export interface SimpleTaskConfig extends BaseTaskConfig {
  type: "SIMPLE";
}
export interface ExclusiveJoinTaskConfig extends BaseTaskConfig {
  type: "EXCLUSIVE_JOIN";
}
export interface SubworkflowTaskConfig extends BaseTaskConfig {
  type: "SUB_WORKFLOW";
}
export interface PlaceholderTaskConfig extends BaseTaskConfig {
  type: "DF_CHILDREN_PLACEHOLDER" | "LOOP_CHILDREN_PLACEHOLDER";
}
// Config use to backfill DF child whose WorkflowTask is not available.
export interface IncompleteDFChildTaskConfig extends BaseTaskConfig {
  type: "UNKNOWN",
  taskReferenceName: string;
  name: string;
}

export type VirtualTaskConfig = EndDoWhileTaskConfig | TerminalTaskConfig | PlaceholderTaskConfig;
export type TaskConfig = SwitchTaskConfig | ForkTaskConfig | DynamicForkTaskConfig | JoinTaskConfig | TerminateTaskConfig | DoWhileTaskConfig | SimpleTaskConfig | ExclusiveJoinTaskConfig | SubworkflowTaskConfig;
export type GenericTaskConfig = TaskConfig | VirtualTaskConfig;

const DYNAMIC_FORK_COLLAPSE_LIMIT = 3;

export default class WorkflowDAG {
  workflowDef: WorkflowDef;
  taskConfigs: GenericTaskConfig[];

  graph: graphlib.Graph;
  taskResultsByRef: Map<string, ExtendedTaskResult[]>;
  taskResultById: Map<string, ExtendedTaskResult>;

  execution?: Execution;


  private constructor(workflowDef: WorkflowDef) {
    this.workflowDef = workflowDef;
    this.taskConfigs = [...workflowDef.tasks];

    this.graph = new graphlib.Graph({ directed: true, compound: false });
    this.taskResultsByRef = new Map();
    this.taskResultById = new Map();
  }


  public static fromWorkflowDef(workflowDef: WorkflowDef) {
    const cls = new WorkflowDAG(workflowDef);

    cls.taskConfigs.unshift({
      type: "TERMINAL",
      taskReferenceName: "__start",
      name: "start"
    });

    cls.taskConfigs.push({
      type: "TERMINAL",
      taskReferenceName: "__final",
      name: "final"
    });

    cls.initialize();
    return cls;
  }

  public static fromExecutionAndTasks(executionAndTasks: ExecutionAndTasks) {
    const { execution, tasks } = executionAndTasks;
    const cls = new WorkflowDAG(execution.workflowDefinition);
    let isTerminated = false;
    cls.execution = execution;

    // Load all task results into Ref and Id keyed maps
    for (let task of tasks) {
      if (task.taskType === "TERMINATE") {
        isTerminated = true;
      }

      cls.addTaskResult(task);
    }

    // Pass 2 - Retrofit Dynamic Forks with forkedTaskRefs
    for (const taskResult of tasks) {
      if (taskResult.parentTaskReferenceName) {
        const parentResult = cls.getTaskResultByRef(taskResult.parentTaskReferenceName) as DynamicForkTaskResult;

        if (!parentResult.forkedTaskRefs) {
          parentResult.forkedTaskRefs = new Set(); // Need to use a set due to potential dups from retries.
        }
        parentResult.forkedTaskRefs.add(taskResult.referenceTaskName);
      }
    }

    // Always add start bubble, and mark it as executed.
    cls.addTaskResult({
      referenceTaskName: "__start",
      taskType: "TERMINAL",
      status: "COMPLETED"
    });

    cls.taskConfigs.unshift({
      type: "TERMINAL",
      taskReferenceName: "__start",
      name: "start"
    });


    // Add completed bubble for all workflows.
    // Mark as completed for COMPLETED but not terminated workflows
    cls.taskConfigs.push({
      type: "TERMINAL",
      taskReferenceName: "__final",
      name: "final"
    });

    if (execution.status === "COMPLETED" && !isTerminated) {
      cls.addTaskResult({
        referenceTaskName: "__final",
        taskType: "TERMINAL",
        status: "COMPLETED"
      });
    }

    cls.initialize()

    return cls;
  }

  node(ref: string) {
    return this.graph.node(ref) as NodeData;
  }

  addTaskResult(task: ExtendedTaskResult) {
    if (!this.taskResultsByRef.has(task.referenceTaskName)) {
      this.taskResultsByRef.set(task.referenceTaskName, []);
    }

    // Cannot be undefined since we just pushed an empty array.
    (this.taskResultsByRef.get(task.referenceTaskName) as ExtendedTaskResult[]).push(task);

    // Terminal and Placeholder pseudotasks do not have IDs
    if (task.taskType !== "TERMINAL") {
      this.taskResultById.set((task as TaskResult).taskId, task);
    }

  }

  getTaskResultByRef(ref: string) {
    return _.last(this.taskResultsByRef.get(ref));
  }


  initialize() {
    // Recursively process tasks
    this.processTaskList(this.taskConfigs, []);

    // Cleanup - All branches are terminated by a user-defined 'TERMINATE' task.
    if (_.isEmpty(this.graph.inEdges("__final"))) {
      this.graph.removeNode("__final");
    }
  }

  getTaskConfigExecutionStatus(taskConfig: GenericTaskConfig) {
    const taskResult = this.getTaskResultByRef(taskConfig.aliasForRef || taskConfig.taskReferenceName);
    return taskResult?.status;
  }



  addVertex(taskConfig: GenericTaskConfig, antecedentConfigs: GenericTaskConfig[], overrides?: {
    status?: TaskStatus,
    tally?: Tally,
    containsTaskRefs?: string[]
  }) {
    
    const effectiveRef = taskConfig.aliasForRef || taskConfig.taskReferenceName;
    const lastTaskResult = this.getTaskResultByRef(effectiveRef);

    let vertex: NodeData = {
      taskConfig: taskConfig,
      taskResults: this.getTaskResultsByRef(effectiveRef)
    }
    
    if(!overrides){
      vertex.status = lastTaskResult?.status;
    }
    else {
      vertex.status = overrides.status;
      vertex.tally = overrides.tally;
      vertex.containsTaskRefs = overrides.containsTaskRefs;
    }

    this.graph.setNode(taskConfig.taskReferenceName, vertex);

    for (let antecedentConfig of antecedentConfigs) {
      const antecedentExecuted = !!this.graph.node(antecedentConfig.taskReferenceName).status;
      const edgeParams = {} as DagEdgeProperties;

      // Special case - When the antecedent of an executed node is a SWITCH or DECISION, the edge may not necessarily be highlighted.
      // E.g. the default edge not taken.
      //
      // SWITCH is the newer version of DECISION and DECISION is deprecated
      //
      // Skip this if current type is DO_WHILE_END - which means the SWITCH is one of the bundled
      // loop tasks and the current task is not the result of a decision
      if ((antecedentConfig.type === "SWITCH" || antecedentConfig.type === "DECISION") && taskConfig.type !== "DO_WHILE_END") {
        
        edgeParams.caseValue = getCaseValue(
          taskConfig.taskReferenceName,
          antecedentConfig
        );

        if (lastTaskResult) {
          const branchTaken = isBranchTaken(lastTaskResult as TaskResult, antecedentConfig);
          edgeParams.executed = branchTaken;
        }

      }
      else {
        edgeParams.executed = antecedentExecuted && !!vertex.status
      }

      this.graph.setEdge(
        antecedentConfig.taskReferenceName,
        taskConfig.taskReferenceName,
        edgeParams
      );
    }
  }

  processTaskList(tasks: GenericTaskConfig[], antecedents: GenericTaskConfig[]) {
    let currAntecedents = antecedents;
    for (const task of tasks) {
      currAntecedents = this.processTask(task, currAntecedents);
    }

    return currAntecedents;
  }

  // Nodes are connected to previous
  processSwitchTask(decisionTask: SwitchTaskConfig, antecedents: GenericTaskConfig[]) {
    const retval = [];

    this.addVertex(decisionTask, antecedents);

    if (_.isEmpty(decisionTask.defaultCase)) {
      retval.push(decisionTask); // Empty default path
    } else {
      retval.push(
        ...this.processTaskList(decisionTask.defaultCase, [decisionTask])
      );
    }

    retval.push(
      ..._.flatten(
        Object.entries(decisionTask.decisionCases).map(([caseValue, tasks]) => {
          return this.processTaskList(tasks, [decisionTask]);
        })
      )
    );

    return retval;
  }

  processForkJoinDynamic(dfTask: DynamicForkTaskConfig, antecedents: GenericTaskConfig[]) {
    // This is the DF task (dotted bar) itself.
    this.addVertex(dfTask, antecedents);
    
    // Only add placeholder if there are 0 spawned tasks for this DF
    const dfTaskResult = this.getTaskResultByRef(dfTask.taskReferenceName) as DynamicForkTaskResult | undefined;
    const forkedTaskRefs = dfTaskResult?.forkedTaskRefs;

    if (!forkedTaskRefs || forkedTaskRefs.size === 0 || forkedTaskRefs.size >= DYNAMIC_FORK_COLLAPSE_LIMIT) {
      
      const { taskConfig: placeholderTaskConfig, status, tally, containsTaskRefs } = this.getDfPlaceholder(dfTask.taskReferenceName, forkedTaskRefs);
      this.addVertex(placeholderTaskConfig, [dfTask], {
        status,
        tally,
        containsTaskRefs
      });
      return [placeholderTaskConfig];

    }
    else {
      let taskConfigs = [];
      for (const taskRef of Array.from(forkedTaskRefs)) {
        const taskResult = this.getTaskResultByRef(taskRef) as TaskResult;
        const taskConfig = makeTaskConfigFromTaskResult(taskResult);
        taskConfigs.push(taskConfig);
        this.addVertex(taskConfig, [dfTask]);
      }
      return taskConfigs;
    }
  }

  processDoWhileTask(doWhileTask: DoWhileTaskConfig, antecedents: GenericTaskConfig[]) {
    const hasDoWhileExecuted = !!this.getTaskConfigExecutionStatus(doWhileTask);

    this.addVertex(doWhileTask, antecedents);

    // aliasForRef indicates when the bottom bar is clicked one we should highlight the ref
    let endDoWhileTaskConfig: EndDoWhileTaskConfig = {
      type: "DO_WHILE_END",
      name: doWhileTask.name,
      taskReferenceName: doWhileTask.taskReferenceName + "-END",
      aliasForRef: doWhileTask.taskReferenceName,
    };
    
    const loopOverRefPrefixes = doWhileTask.loopOver.map(
      (t) => t.taskReferenceName
    );
    if (hasDoWhileExecuted) {
      // map already dedupes for retries.
      const loopOverRefs = Array.from(this.taskResultsByRef.keys()).filter(
        (key) => {
          for (let prefix of loopOverRefPrefixes) {
            if (key.startsWith(prefix + "__")) return true;
          }
          return false;
        }
      );

      const loopTaskResults = [];
      for (let ref of loopOverRefs) {
        const refList = this.taskResultsByRef.get(ref) || [];
        loopTaskResults.push(...refList);
      }

      // Collpase into stack
      const { taskConfig: placeholderTaskConfig, status, tally, containsTaskRefs} = this.getDoWhilePlaceholder(doWhileTask.taskReferenceName, loopOverRefs);
      
      this.addVertex(placeholderTaskConfig, [doWhileTask], {
        status, tally, containsTaskRefs
      });

      // Add bar marking End of Loop - inherit stack status
      this.addVertex(endDoWhileTaskConfig, [placeholderTaskConfig], {
        status
      });

    } else {
      // Definition view (or not executed)

      this.processTaskList(doWhileTask.loopOver, [doWhileTask]);

      const lastLoopTask = _.last(doWhileTask.loopOver);
      if (!lastLoopTask) {
        throw new Error("loopOver cannot be empty")
      }

      // Connect the end of each case to the loop end
      if (
        lastLoopTask?.type === "SWITCH" ||
        lastLoopTask?.type === "DECISION"
      ) {
        Object.entries(lastLoopTask.decisionCases).forEach(
          ([caseValue, tasks]) => {
            const lastTaskInCase = _.last(tasks);
            if (lastTaskInCase) {
              this.addVertex(endDoWhileTaskConfig, [lastTaskInCase]);
            }
          }
        );
      }

      // Default case
      this.addVertex(endDoWhileTaskConfig, [lastLoopTask]);
    }


    return [endDoWhileTaskConfig];
  }

  processForkJoin(forkJoinTask: ForkTaskConfig, antecedents: GenericTaskConfig[]) {
    let outerForkTasks = forkJoinTask.forkTasks || [];

    // Add FORK_JOIN task itself (solid bar)
    this.addVertex(forkJoinTask, antecedents);

    // Each sublist is executed in parallel. Tasks within sublist executed sequentially
    return _.flatten(
      outerForkTasks.map((innerForkTasks) =>
        this.processTaskList(innerForkTasks, [forkJoinTask])
      )
    );
  }

  // Works even for externalized because we no longer rely on reading inputData and outputData.
  processJoin(joinTask: JoinTaskConfig, antecedents: GenericTaskConfig[]) {
    this.addVertex(joinTask, antecedents);
    return [joinTask];
  }

  // returns tails = [...]
  processTask(task: GenericTaskConfig, antecedents: GenericTaskConfig[]) {
    switch (task.type) {
      case "FORK_JOIN": {
        return this.processForkJoin(task, antecedents);
      }

      case "FORK_JOIN_DYNAMIC": {
        return this.processForkJoinDynamic(task, antecedents);
      }

      case "DECISION": // DECISION is deprecated and will be removed in a future release
      case "SWITCH": {
        return this.processSwitchTask(task as unknown as SwitchTaskConfig, antecedents);
      }

      case "TERMINATE": {
        this.addVertex(task, antecedents);
        return [];
      }

      case "DO_WHILE": {
        return this.processDoWhileTask(task, antecedents);
      }

      case "JOIN": {
        return this.processJoin(task, antecedents);
      }
      /*
      case "TERMINAL":
      case "EVENT":
      case "SUB_WORKFLOW":
      case "EXCLUSIVE_JOIN":
      */
      default: {
        this.addVertex(task, antecedents);
        return [task];
      }
    }
  }

  getDFSiblingsByCoord(taskCoordinate?: TaskCoordinate) {
    if (!taskCoordinate) return undefined;

    const taskResult = this.getTaskResultByCoord(taskCoordinate) as BaseTaskResult;
    if (!taskResult.parentTaskReferenceName) {
      return undefined;
    }
    const parentResult = this.getTaskResultByRef(taskResult.parentTaskReferenceName) as DynamicForkTaskResult;

    if (!parentResult.forkedTaskRefs) {
      throw new Error('parent DF missing forkedTaskRefs')
    }
    return Array.from(parentResult.forkedTaskRefs).map(ref => this.getTaskResultByRef(ref));
  }

  getTaskResultById(id: string) {
    const result = this.taskResultById.get(id);
    if (!result) throw new Error('no result for task id');
    return result
  }

  getTaskResultsByRef(ref: string) {
    return this.taskResultsByRef.get(ref) || [];
  }


  getTaskResultAttemptsByCoord(taskCoordinate?: TaskCoordinate) {
    if (!taskCoordinate) return undefined;

    if (taskCoordinate.id) {
      const taskResult = this.getTaskResultById(taskCoordinate.id);
      if (taskResult) {
        const ref = taskResult.referenceTaskName;
        return this.taskResultsByRef.get(ref);
      }
    }
    else if (taskCoordinate.ref) {
      return this.taskResultsByRef.get(taskCoordinate.ref);
    }
    else {
      throw new Error('invalid taskCoordinate');
    }
  }

  getTaskResultByCoord(taskCoordinate?: TaskCoordinate): ExtendedTaskResult | undefined {
    if (!taskCoordinate) return undefined;

    if (taskCoordinate.id) {
      return this.getTaskResultById(taskCoordinate.id);
    }
    else if (taskCoordinate.ref) {
      return this.getTaskResultByRef(taskCoordinate.ref);
    }
    else {
      throw new Error('invalid taskCoordinate');
    }
  }

  getTaskConfigByRef(ref: string): GenericTaskConfig | IncompleteDFChildTaskConfig {
    const node = this.node(ref);
    if (node) {
      return node.taskConfig;
    }
    else {
      // Node not found by ref. (e.g. DF child). Return minimal TaskConfig
      const taskResult = this.getTaskResultByRef(ref) as BaseTaskResult;
      if(taskResult){
        return {
          taskReferenceName: ref,
          name: taskResult.taskDefName
        } as IncompleteDFChildTaskConfig;
      }
      else {
        throw new Error("No taskConfig found for ref.")
      }
    }
  }

  getTaskConfigByCoord(taskCoordinate?: TaskCoordinate): GenericTaskConfig | IncompleteDFChildTaskConfig | undefined {
    if (!taskCoordinate) return undefined;
    let ref;
    if (taskCoordinate.id) {
      const taskResult = this.taskResultById.get(taskCoordinate.id) as TaskResult;
      if (!taskResult) throw new Error("Task ID not found.");
      ref = taskResult.referenceTaskName;
    } else {
      ref = (taskCoordinate as TaskCoordinateRef).ref;
    }

    return this.getTaskConfigByRef(ref);
  }


  getDfPlaceholder(dfRef: string, forkedTaskRefs: Set<string> = new Set<string>()) {
    let tally: Tally | undefined =undefined, status: TaskStatus |undefined =undefined;

    if(this.getTaskResultByRef(dfRef)){
      tally = Array.from(forkedTaskRefs)
      .map((ref) => {
        const childResult = this.getTaskResultByRef(ref);
        if (!childResult) {
          throw new Error("Invalid ref encountered.")
        }
        return childResult.status
      })
      .reduce(
        (prev: Tally, curr) => {
          const retval: Tally = { ...prev }

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
        }
      );
      if (tally.success === tally.total) {
        status = "COMPLETED";
      } else if (tally.inProgress) {
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
      containsTaskRefs: status? Array.from(forkedTaskRefs): undefined
    }
  };

  getDoWhilePlaceholder(doWhileRef: string, loopTaskRefs: string[] = []): { 
    taskConfig: PlaceholderTaskConfig,
    status: TaskStatus,
    tally: Tally,
    containsTaskRefs: string[]
  } {
    const tally = Array.from(loopTaskRefs)
      .map((ref) => {
        const childResult = this.getTaskResultByRef(ref);
        if (!childResult) {
          throw new Error("Invalid ref encountered.")
        }
        return childResult.status
      })
      .reduce(
        (prev: Tally, curr) => {
          const retval: Tally = { ...prev }

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
        }
      );

    const placeholderRef = doWhileRef + "_LOOP_CHILDREN_PLACEHOLDER";

    let status: TaskStatus;
    if (tally.success === tally.total) {
      status = "COMPLETED";
    } else if (tally.inProgress) {
      status = "IN_PROGRESS";
    } else {
      status = "FAILED";
    }

    const placeholderConfig: PlaceholderTaskConfig = {
      name: placeholderRef,
      taskReferenceName: placeholderRef,
      type: "LOOP_CHILDREN_PLACEHOLDER",
    };

    return {
      taskConfig: placeholderConfig,
      status,
      tally,
      containsTaskRefs: loopTaskRefs
    }
  };
}


function getCaseValue(ref: string, decisionTask: SwitchTaskConfig) {
  if (decisionTask.defaultCase[0]?.taskReferenceName === ref) {
    return "default";
  }

  for (const [caseValue, taskList] of Object.entries(
    decisionTask.decisionCases
  )) {
    if (!_.isEmpty(taskList) && ref === taskList[0].taskReferenceName) {
      return caseValue;
    }
  }
}

// Try to infer caseValue
function isBranchTaken(branchTaskResult: TaskResult, decisionTaskConfig: SwitchTaskConfig) {
  const branchRef = branchTaskResult.referenceTaskName;

  if (decisionTaskConfig.defaultCase[0]?.taskReferenceName === branchTaskResult.referenceTaskName) {
    return true;
  }

  for(const value of Object.values(decisionTaskConfig.decisionCases)){
    if (branchRef === value[0]?.taskReferenceName) {
      return true;     
    }
  }
  return false;
}

function makeTaskConfigFromTaskResult(task: TaskResult): TaskConfig {
  let type: TaskConfigType;
  if (task.taskType === "FORK") {
    if (task.parentTaskReferenceName) {
      type = "FORK_JOIN_DYNAMIC";
    }
    else {
      type = "FORK_JOIN";
    }
  }
  else {
    type = task.taskType;
  }
  return {
    name: task.taskDefName,
    taskReferenceName: task.referenceTaskName,
    type: type
  } as TaskConfig;
}


/*

Node {
  taskResults: [... TaskResult]
}

TaskResult {
  ...[Task Result fields only present if executed],
}

Assume workflowTask never populated.

*/
