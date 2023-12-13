import { HumanTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const humanTaskSchema = extendSchema("HUMAN", [
  "name",
  "taskReferenceName",
  "description",
]);

export function createNewHumanTask(taskReferenceName) {
  return generateBoilerplateTask<HumanTaskConfig>(
    humanTaskSchema,
    taskReferenceName,
    {},
  );
}
