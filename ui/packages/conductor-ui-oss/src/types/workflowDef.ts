export const TASK_CONFIG_TYPES = [
  "SIMPLE",
  "TERMINATE",
  "SWITCH",
  "DYNAMIC",
  "FORK_JOIN",
  "FORK_JOIN_DYNAMIC",
  "JOIN",
  "DO_WHILE",
  "SUB_WORKFLOW",
  "SET_VARIABLE",
  "START_WORKFLOW",
  "HTTP",
  "INLINE",
  "JSON_JQ_TRANSFORM",
  "WAIT",
  "EVENT",
  "HUMAN",
] as const;

export const DEPRECATED_TASK_CONFIG_TYPES = [
  "EXCLUSIVE_JOIN",
  "DECISION",
] as const;

export const VIRTUAL_TASK_CONFIG_TYPES = [
  "START",
  "FINAL",
  "DO_WHILE_END",
  "DF_CHILDREN_PLACEHOLDER",
  "LOOP_CHILDREN_PLACEHOLDER",
  "LOOP_CONTAINER",
  "UNKNOWN",
] as const;

export type TaskConfigType =
  | (typeof TASK_CONFIG_TYPES)[number]
  | (typeof DEPRECATED_TASK_CONFIG_TYPES)[number];
export type VirtualTaskConfigType = (typeof VIRTUAL_TASK_CONFIG_TYPES)[number];
export type ExtendedTaskConfigType = TaskConfigType | VirtualTaskConfigType;

export type Tally = {
  success: number;
  inProgress: number;
  canceled: number;
  failed: number;
  total: number;
  iterations?: number;
};

export type WorkflowDef = {
  tasks: TaskConfig[];
  name: string;
  version: number;
  inputParameters?: any;
  inputExpression?: any;
};

export type TaskCoordinateId = { id: string; ref?: string };
export type TaskCoordinateRef = { id?: string; ref: string };
export type TaskCoordinate = TaskCoordinateId | TaskCoordinateRef;

export type DagEdgeProperties = {
  caseValue?: string; // Only present for SWITCH
  executed: boolean;
};

export type InputExpression = {
  expression: string;
  type: string;
};

type BaseTaskConfig = {
  taskReferenceName: string;
  type: ExtendedTaskConfigType;
  name: string;
  inputParameters?: any;
  inputExpression?: InputExpression;
  aliasForRef?: string;
  asyncComplete?: boolean;
};
// Custom Task Config Types

export interface SwitchTaskConfig extends BaseTaskConfig {
  type: "SWITCH";
  defaultCase: GenericTaskConfig[];
  evaluatorType: string;
  expression: string;
  decisionCases: { [key: string]: GenericTaskConfig[] };
}
export interface ForkTaskConfig extends BaseTaskConfig {
  type: "FORK_JOIN";
  forkTasks: GenericTaskConfig[][];
}
export interface DynamicTaskConfig extends BaseTaskConfig {
  type: "DYNAMIC";
  dynamicTaskNameParam?: string;
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
  loopOver: GenericTaskConfig[];
  loopCondition: string;
}
export interface EndDoWhileTaskConfig extends BaseTaskConfig {
  type: "DO_WHILE_END";
}
export interface StartTaskConfig extends BaseTaskConfig {
  type: "START";
}
export interface FinalTaskConfig extends BaseTaskConfig {
  type: "FINAL";
}
export interface SimpleTaskConfig extends BaseTaskConfig {
  type: "SIMPLE";
}
export interface ExclusiveJoinTaskConfig extends BaseTaskConfig {
  type: "EXCLUSIVE_JOIN";
}
export interface SubworkflowTaskConfig extends BaseTaskConfig {
  type: "SUB_WORKFLOW";
  subWorkflowParam: any;
}
export interface HttpTaskConfig extends BaseTaskConfig {
  type: "HTTP";
}
export interface TerminateTaskConfig extends BaseTaskConfig {
  type: "TERMINATE";
}
export interface InlineTaskConfig extends BaseTaskConfig {
  type: "INLINE";
}
export interface JQTransformTaskConfig extends BaseTaskConfig {
  type: "JSON_JQ_TRANSFORM";
}
export interface WaitTaskConfig extends BaseTaskConfig {
  type: "WAIT";
}
export interface HumanTaskConfig extends BaseTaskConfig {
  type: "HUMAN";
}
export interface PlaceholderTaskConfig extends BaseTaskConfig {
  type: "DF_CHILDREN_PLACEHOLDER" | "LOOP_CHILDREN_PLACEHOLDER";
}
export interface StartWorkflowTaskConfig extends BaseTaskConfig {
  type: "START_WORKFLOW";
}
export interface SetVariableTaskConfig extends BaseTaskConfig {
  type: "SET_VARIABLE";
}
export interface LoopContainerConfig extends BaseTaskConfig {
  type: "LOOP_CONTAINER";
}

// Deprecated
export interface DecisionTaskConfig extends BaseTaskConfig {
  type: "DECISION";
}

// Config used to backfill DF child whose WorkflowTask is not available.
export interface IncompleteDFChildTaskConfig extends BaseTaskConfig {
  type: "UNKNOWN";
  taskReferenceName: string;
  name: string;
}

export type VirtualTaskConfig =
  | EndDoWhileTaskConfig
  | StartTaskConfig
  | FinalTaskConfig
  | PlaceholderTaskConfig
  | IncompleteDFChildTaskConfig
  | LoopContainerConfig;

export type TaskConfig =
  | SwitchTaskConfig
  | ForkTaskConfig
  | DynamicForkTaskConfig
  | JoinTaskConfig
  | TerminateTaskConfig
  | DoWhileTaskConfig
  | SimpleTaskConfig
  | ExclusiveJoinTaskConfig
  | SubworkflowTaskConfig
  | HttpTaskConfig
  | SubworkflowTaskConfig
  | TerminateTaskConfig
  | InlineTaskConfig
  | JQTransformTaskConfig
  | WaitTaskConfig
  | HumanTaskConfig
  | StartWorkflowTaskConfig
  | DynamicTaskConfig
  | SetVariableTaskConfig
  | DecisionTaskConfig;

export type GenericTaskConfig = TaskConfig | VirtualTaskConfig;
