import { ReactNode } from "react";
import { ExecutionAndTasks } from "../../../../../types/execution";

// Add rules here
import { checkPollCountAndCallBackAfterSeconds } from "./checkPollCountAndCallbackAfterSeconds";
import { checkDeprecatedTaskTypes } from "./checkDeprecatedTaskTypes";
import { checkTasksScheduledForLongTime } from "./checkTasksScheduledForLongTime";
import WorkflowDAG from "../../../../../data/dag/WorkflowDAG";

export type Severity = "ERROR" | "WARNING" | "INFO";

export type AlertItem = {
  component: ReactNode;
  severity: Severity;
};

export type Rule = (
  executionAndTasks: ExecutionAndTasks,
  dag: WorkflowDAG,
) => AlertItem[];

export const rules: Rule[] = [
  checkPollCountAndCallBackAfterSeconds,
  checkDeprecatedTaskTypes,
  checkTasksScheduledForLongTime,
];
