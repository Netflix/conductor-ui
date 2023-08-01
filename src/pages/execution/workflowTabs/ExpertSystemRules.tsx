import { ReactNode } from "react";
import { ExecutionAndTasks } from "../../../types/execution";
import { timestampRenderer } from "../../../utils/helpers";
import { Alert } from "@mui/material";
import React from "react";

export type Severity = "ERROR" | "WARNING" | "INFO";

export type AlertItem = {
  component: ReactNode;
  severity: Severity;
};

export type Rule = (executionAndTasks: ExecutionAndTasks) => AlertItem[];

// Rule functions
export const checkPollCountAndCallBackAfterSeconds: Rule = (executionAndTasks) => {
  const alerts: AlertItem[]= [];
  const tasks = executionAndTasks.tasks;
  tasks.forEach((taskResult) => {
    //detect multiple polls and callbackafterseconds >0
    if (taskResult.pollCount && taskResult.pollCount > 1) {
      const formatedDate =
        !isNaN(taskResult.updateTime!) && taskResult.updateTime! > 0
          ? timestampRenderer(taskResult.updateTime)
          : "N/A";
      let alertMessage = `Task "${taskResult.referenceTaskName}" has been polled by workers for ${taskResult.pollCount} times.`;
      if (taskResult.callbackAfterSeconds! > 0)
        alertMessage += ` A callback is set to ${taskResult.callbackAfterSeconds} seconds at ${formatedDate}`;
      const newAlertItem: AlertItem = {
        component: <Alert severity="warning">{alertMessage}</Alert>,
        severity: "WARNING",
      };
      alerts.push(newAlertItem);
    }
  });
  return alerts;
};

export const rules: Rule[] = [checkPollCountAndCallBackAfterSeconds];
