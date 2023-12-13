import { SimpleTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const simpleTaskSchema = extendSchema("SIMPLE", [
  "name",
  "taskReferenceName",
  "description",
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
]);

export function createNewSimpleTask(taskReferenceName) {
  return generateBoilerplateTask<SimpleTaskConfig>(
    simpleTaskSchema,
    taskReferenceName,
    {},
  );
}
