import { JoinTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const joinTaskSchema = extendSchema("JOIN", [
  "name",
  "taskReferenceName",
  "description",
  "optional",
]);

export function createNewJoinTask(taskReferenceName) {
  return generateBoilerplateTask<JoinTaskConfig>(
    joinTaskSchema,
    taskReferenceName,
    {
      joinOn: [],
    },
  );
}

export function createNewJoinTaskForDynamicFork(taskReferenceName) {
  return generateBoilerplateTask<JoinTaskConfig>(
    joinTaskSchema,
    taskReferenceName,
    {},
  );
}
