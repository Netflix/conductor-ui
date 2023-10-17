import { AlertItem, Rule } from "./ExpertSystemRules";

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
            component: alertMessage,
            severity: "WARNING",
          };
          alerts.push(newAlertItem);
        }
      }
    });
    return alerts;
  };
  