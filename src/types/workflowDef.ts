export const TASK_CONFIG_TYPES = [
  "SIMPLE",
  "TERMINATE",
  "SWITCH",
  "FORK_JOIN",
  "FORK_JOIN_DYNAMIC",
  "JOIN",
  "DO_WHILE",
  "SUB_WORKFLOW",
  "HTTP",
  "INLINE",
  "JQ_TRANSFORM",
  "WAIT",
] as const;
export const DEPRECATED_TASK_CONFIG_TYPES = [
  "EXCLUSIVE_JOIN",
  "DECISION",
] as const;
export const VIRTUAL_TASK_CONFIG_TYPES = [
  "DO_WHILE_END",
  "TERMINAL",
  "DF_CHILDREN_PLACEHOLDER",
  "LOOP_CHILDREN_PLACEHOLDER",
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
};

export type TaskCoordinateId = { id: string; ref?: string };
export type TaskCoordinateRef = { id?: string; ref: string };
export type TaskCoordinate = TaskCoordinateId | TaskCoordinateRef;

export type DagEdgeProperties = {
  caseValue?: string; // Only present for SWITCH
  executed: boolean;
};
type BaseTaskConfig = {
  taskReferenceName: string;
  type: ExtendedTaskConfigType;
  name: string;
  inputParameters?: any;
  aliasForRef?: string;
};
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
  loopOver: GenericTaskConfig[];
  loopCondition: string;
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
  type: "JQ_TRANSFORM";
}
export interface WaitTaskConfig extends BaseTaskConfig {
  type: "WAIT";
}
export interface PlaceholderTaskConfig extends BaseTaskConfig {
  type: "DF_CHILDREN_PLACEHOLDER" | "LOOP_CHILDREN_PLACEHOLDER";
}
// Config use to backfill DF child whose WorkflowTask is not available.

export interface IncompleteDFChildTaskConfig extends BaseTaskConfig {
  type: "UNKNOWN";
  taskReferenceName: string;
  name: string;
}

export type VirtualTaskConfig =
  | EndDoWhileTaskConfig
  | TerminalTaskConfig
  | PlaceholderTaskConfig;
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
  | WaitTaskConfig;

export type GenericTaskConfig = TaskConfig | VirtualTaskConfig;
