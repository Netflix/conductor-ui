import { DoWhileTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const doWhileTaskSchema = extendSchema("DO_WHILE", [
  "name",
  "taskReferenceName",
  "description",
]);

export function createNewDoWhileTask(taskReferenceName) {
  return generateBoilerplateTask<DoWhileTaskConfig>(
    doWhileTaskSchema,
    taskReferenceName,
    {
      loopCondition: "",
      loopOver: [],
    },
  );
}
