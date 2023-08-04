import { ReactNode } from "react";
import { ExecutionAndTasks } from "../../../types/execution";
import { Alert } from "@mui/material";
import React from "react";

export type Severity = "ERROR" | "WARNING" | "INFO";

export type AlertItem = {
  component: ReactNode;
  severity: Severity;
};

export type Rule = (executionAndTasks: ExecutionAndTasks) => AlertItem[];

// Rule functions
export const checkPollCountAndCallBackAfterSeconds: Rule = (
  executionAndTasks,
) => {
  const alerts: AlertItem[] = [];
  const tasks = executionAndTasks.tasks;
  tasks.forEach((taskResult) => {
    //detect multiple polls and callbackafterseconds >0
    if (
      taskResult.pollCount &&
      taskResult.pollCount > 1 &&
      taskResult.status === "SCHEDULED"
    ) {
      let alertMessage = `Task "${taskResult.referenceTaskName}" was picked up by worker ${taskResult.workerId} but returned to Conductor for delayed processing.`;
      if (taskResult.callbackAfterSeconds! > 0)
        alertMessage += ` Because the callBackAfterSeconds is set to ${taskResult.callbackAfterSeconds} seconds by the worker, Conductor will not reschedule the task until task time passes.`;
      const newAlertItem: AlertItem = {
        component: <Alert severity="info">{alertMessage}</Alert>,
        severity: "INFO",
      };
      alerts.push(newAlertItem);
    }
  });
  return alerts;
};

export const checkDeprecatedTaskTypes: Rule = (executionAndTasks) => {
  const alerts: AlertItem[] = [];
  const tasks = executionAndTasks.tasks;

  // Use a map to store task names for each task type
  const taskNamesByType: Map<string, string[]> = new Map();

  tasks.forEach((taskResult) => {
    const taskType = String(taskResult.taskType); // Convert taskType to string

    if (
      taskType === "DECISION" ||
      taskType === "LAMBDA" ||
      taskType === "ARCHER"
    ) {
      // Check if the task type exists in the map
      if (!taskNamesByType.has(taskType)) {
        // If it doesn't exist, create a new entry with an empty array
        taskNamesByType.set(taskType, []);
      }

      // Push the task name to the corresponding task type array
      taskNamesByType.get(taskType)?.push(`"${taskResult.referenceTaskName}"`);
    }
  });

  // Generate combined alert messages for each task type
  taskNamesByType.forEach((taskNames, taskType) => {
    const lastTaskName = taskNames.pop(); // Remove the last element from the array

    let alertMessage = "";
    if (taskNames.length === 0) {
      // If there's only one task, display its name
      alertMessage = `Task ${lastTaskName} uses the deprecated task type "${taskType}".`;
    } else if (taskNames.length === 1) {
      // If there are two tasks, combine them with 'and'
      alertMessage = `Tasks ${taskNames[0]} and ${lastTaskName} use the deprecated task type "${taskType}".`;
    } else {
      // If there are more than two tasks, combine them with commas and 'and'
      alertMessage = `Tasks ${taskNames.join(
        ", ",
      )}, and ${lastTaskName} use the deprecated task type "${taskType}".`;
    }

    if (taskType !== "ARCHER") {
      // Append the second sentence for non-ARCHER task types
      const newTaskType = getNewTaskType(taskType);
      alertMessage += ` Please use "${newTaskType}" instead.`;
    }

    const newAlertItem: AlertItem = {
      component: <Alert severity="warning">{alertMessage}</Alert>,
      severity: "WARNING",
    };

    alerts.push(newAlertItem);
  });

  return alerts;
};

// Function to get the new task type based on the deprecated task type
function getNewTaskType(taskType: string): string {
  switch (taskType) {
    case "DECISION":
      return "SWITCH";
    case "LAMBDA":
      return "INLINE";
    default:
      return "UNKNOWN";
  }
}

export const checkTasksScheduledForLongTime: Rule = (executionAndTasks) => {
  const alerts: AlertItem[] = [];
  const tasks = executionAndTasks.tasks;
  tasks.forEach((taskResult) => {
    if (
      taskResult.status === "SCHEDULED" &&
      taskResult.scheduledTime &&
      taskResult.pollCount !== undefined &&
      taskResult.pollCount === 0
    ) {
      const timeElapsedSincedScheduled =
        new Date().getTime() - taskResult.scheduledTime;
      if (timeElapsedSincedScheduled > 60 * 60 * 1000) {
        let alertMessage = `Task "${taskResult.referenceTaskName}" has been in the "SCHEDULED" state for more than 1 hour without having been picked up by a worker. Please ensure there are workers polling for this task`;
        if (taskResult.domain) {
          alertMessage += ` in the domain "${taskResult.domain}".`;
        } else {
          alertMessage += ".";
        }
        const newAlertItem: AlertItem = {
          component: <Alert severity="info">{alertMessage}</Alert>,
          severity: "WARNING",
        };
        alerts.push(newAlertItem);
      }
    }
  });
  return alerts;
};

export const rules: Rule[] = [
  checkPollCountAndCallBackAfterSeconds,
  checkDeprecatedTaskTypes,
  checkTasksScheduledForLongTime,
];
