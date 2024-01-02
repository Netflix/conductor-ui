import { ForkTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const forkJoinTaskSchema = extendSchema("FORK_JOIN", [
  "name",
  "taskReferenceName",
  "description",
]);

export function createNewForkJoinTask(taskReferenceName) {
  return generateBoilerplateTask<ForkTaskConfig>(
    forkJoinTaskSchema,
    taskReferenceName,
    {
      forkTasks: [],
    },
  );
}
