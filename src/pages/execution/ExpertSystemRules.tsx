import { ReactNode } from "react";
import { ExecutionAndTasks, TaskResult } from "../../types/execution";
import { timestampRenderer } from "../../utils/helpers";
import { Alert } from "@mui/material";

export type Severity = "ERROR" | "WARNING" | "INFO";

export type AlertItem = {
  component: ReactNode;
  severity: Severity;
};

export type Rule = (
  executionAndTasks: ExecutionAndTasks,
  severity: Severity,
) => [AlertItem[], Severity];


const findMaxSeverity = (
  alerts: AlertItem[],
  currentMaxSeverity: Severity,
): Severity => {
  for (const alert of alerts) {
    // Compare the severity levels and update the maxSeverity accordingly
    if (alert.severity === "ERROR") {
      return "ERROR";
    } else if (alert.severity === "WARNING" && currentMaxSeverity !== "ERROR") {
      return "WARNING";
    }
  }
  return currentMaxSeverity;
};

// Rule functions
const checkPollCountAndCallBackAfterSeconds: Rule = (executionAndTasks, severity) => {
  const alerts = [];
  const tasks = executionAndTasks.tasks;
  tasks.forEach((taskResult) => {
    //detect multiple polls and callbackafterseconds >0
    if (taskResult.pollCount > 1) {
      const formatedDate =
        !isNaN(taskResult.updateTime) && taskResult.updateTime > 0
          ? timestampRenderer(taskResult.updateTime)
          : "N/A";
      let alertMessage = `Task "${taskResult.referenceTaskName}" has been polled by workers for ${taskResult.pollCount} times.`;
      if (taskResult.callbackAfterSeconds > 0)
        alertMessage += ` A callback is set to ${taskResult.callbackAfterSeconds} seconds at ${formatedDate}`;
      const newAlertItem: AlertItem = {
        component: <Alert severity="warning">{alertMessage}</Alert>,
        severity: "WARNING",
      };
      alerts.push(newAlertItem);
    }
  });
  const maxSeverity = findMaxSeverity(alerts, severity);
  return [alerts, maxSeverity];
};

export const rules: Rule[] = [checkPollCountAndCallBackAfterSeconds];
