import { AlertItem, Rule } from "./ExpertSystemRules";

export const asyncCompleteInProgress: Rule = (executionAndTasks, dag) => {
  const alerts: AlertItem[] = [];
  const tasks = executionAndTasks.tasks;
  tasks.forEach((taskResult) => {
    const taskConfig = dag.getTaskConfigByCoord({ id: taskResult.taskId });

    if (
      taskResult.status === "IN_PROGRESS" &&
      taskConfig.asyncComplete &&
      (taskResult.taskType === "EVENT" ||
        taskResult.taskType === "HTTP" ||
        taskResult.taskType === "TITUS")
    ) {
      let alertMessage = `Task "${taskResult.referenceTaskName}" was configured for asyncComplete. It will block until completed via external action.`;

      const newAlertItem: AlertItem = {
        component: alertMessage,
        severity: "WARNING",
      };
      alerts.push(newAlertItem);
    }
  });
  return alerts;
};
