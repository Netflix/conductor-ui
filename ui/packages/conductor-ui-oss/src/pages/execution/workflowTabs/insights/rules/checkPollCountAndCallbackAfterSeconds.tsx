import { AlertItem, Rule } from "./ExpertSystemRules";

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
        alertMessage += ` Because callBackAfterSeconds was set to ${taskResult.callbackAfterSeconds} seconds by the worker, Conductor will not reschedule the task until that time has passed. This condition has occured ${taskResult.pollCount} times. If this is the intended behavior, then no action is necessary.`;
      const newAlertItem: AlertItem = {
        component: alertMessage,
        severity: "INFO",
      };
      alerts.push(newAlertItem);
    }
  });
  return alerts;
};
