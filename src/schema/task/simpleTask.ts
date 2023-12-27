import { SimpleTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const simpleTaskSchema = extendSchema("SIMPLE", [
  "name",
  "taskReferenceName",
  "description",
  "retryCount",
  "startDelay",
  "optional",
]);

export function createNewSimpleTask(taskReferenceName) {
  return generateBoilerplateTask<SimpleTaskConfig>(
    simpleTaskSchema,
    taskReferenceName,
    {},
  );
}
