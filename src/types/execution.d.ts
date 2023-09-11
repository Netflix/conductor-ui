import { TaskConfig, WorkflowDef } from "./workflowDef";
import { TaskConfigType } from "./workflowDef";

export type ExecutionStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS";
export type TaskStatus =
  | "COMPLETED"
  | "FAILED"
  | "IN_PROGRESS"
  | "CANCELED"
  | "SCHEDULED";

type BaseTaskResultType = Omit<
  TaskConfigType,
  ForkTaskResultType | SwitchTaskResultType | DoWhileTaskResultType
>;
type BaseTaskResult = {
  taskId: string;
  referenceTaskName: string;
  taskDefName: string;
  status: TaskStatus;
  workflowInstanceId: string;

  startTime: number;
  endTime: number;
  aliasForRef: string;
  reasonForIncompletion: string;
  workerId: string;
  subWorkflowId: string;

  scheduledTime?: number;
  parentTaskReferenceName?: string;
  retryCount?: number;
  iteration?: number;
  retried?: boolean;
  domain?: string;
  workflowTask?: TaskConfig;
  pollCount?: number;
  updateTime?: number;
  callbackAfterSeconds?: number;
};

export type ForkTaskResultType = "FORK" | "FORK_JOIN" | "FORK_JOIN_DYNAMIC"; //FORK is legacy.
export interface ForkTaskResult extends BaseTaskResult {
  taskType: ForkTaskResultType;
  forkedTaskRefs?: Set<string>; // Internal use only
}

export type SwitchTaskResultType = "SWITCH" | "DECISION"; //DECISION is legacy.
export interface SwitchTaskResult extends BaseTaskResult {
  taskType: SwitchTaskResultType;
  executedCaseRef?: string; // Internal use only
}

export type DoWhileTaskResultType = "DO_WHILE";
export interface DoWhileTaskResult extends BaseTaskResult {
  taskType: DoWhileTaskResultType;
  loopTaskIds?: string[];
}

export type TaskResultType =
  | BaseTaskResultType
  | ForkTaskResultType
  | SwitchTaskResultType
  | DoWhileTaskResultType;
export type TaskResult =
  | (BaseTaskResult & { taskType: BaseTaskResultType })
  | ForkTaskResult
  | SwitchTaskResult
  | DoWhileTaskResult;

type TerminalTaskResult = {
  referenceTaskName: string;
  taskType: "TERMINAL";
  status: TaskStatus;
  parentTaskReferenceName?: string;
};

export type ExtendedTaskResult = TaskResult | TerminalTaskResult;

export type ExecutionAndTasks = {
  execution: Execution;
  tasks: TaskResult[];
};

export type Execution = {
  workflowId: string;
  parentWorkflowId?: string;
  workflowName: string;
  status: ExecutionStatus;
  workflowDefinition: WorkflowDef;
  reasonForIncompletion?: string;
  workflowEngine?: string;
  workflowVersion?: string;
  startTime?: number;
  endTime?: number;
  parentWorkflowTaskId?: string;
  externalInputPayloadStoragePath?: string; // TODO: can be removed for conductor 4
  externalOutputPayloadStoragePath?: string; // TODO: can be removed for conductor 4
};
