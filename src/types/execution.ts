import { WorkflowDef } from "./workflowDef";
import { TaskConfigType } from "./workflowDef";

export type ExecutionStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS";
export type TaskStatus =
  | "COMPLETED"
  | "FAILED"
  | "IN_PROGRESS"
  | "CANCELED"
  | "SCHEDULED";

export type BaseTaskResultType = TaskConfigType| "SIMPLE";

export type ForkTaskResultType = "FORK" | "FORK_JOIN" | "FORK_JOIN_DYNAMIC"; //FORK is legacy.
export type TaskResultType = BaseTaskResultType | ForkTaskResultType;

export type BaseTaskResult = {
  taskId: string;
  taskType: TaskResultType;
  referenceTaskName: string;
  taskDefName: string;
  status: TaskStatus;
  workflowInstanceId: string;

  parentTaskReferenceName?: string;
  retryCount?: number;
  iteration?: number;
};
export type TaskResult = BaseTaskResult | DynamicForkTaskResult;

type TerminalTaskResult = {
  referenceTaskName: string;
  taskType: "TERMINAL";
  status: TaskStatus;
};

export interface DynamicForkTaskResult extends BaseTaskResult {
  taskType: ForkTaskResultType;
  forkedTaskRefs?: Set<string>; // Internal use only
}
export type ExtendedTaskResult = TaskResult | TerminalTaskResult;

export type ExecutionAndTasks = {
  execution?: Execution;
  tasks?: TaskResult[];
  loading: boolean;
};

export type Execution = {
  workflowId: string;
  parentWorkflowId?: string;
  workflowName: string;
  status: ExecutionStatus;
  workflowDefinition: WorkflowDef;
  reasonForIncompletion?: string;
  workflowEngine?: string;
};
