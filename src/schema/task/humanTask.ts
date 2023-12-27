import { HumanTaskConfig } from "../../types/workflowDef";
import {
  SchemaType,
  extendSchema,
  generateBoilerplateTask,
} from "../schemaUtils";

export const humanTaskSchema = extendSchema("HUMAN", [
  "name",
  "taskReferenceName",
  "description",
]);

export const humanTaskInputParameters = [
  {
    key: "timeout",
    defaultValue: undefined,
    required: false,
    type: "string" as SchemaType,
  },
];

export function createNewHumanTask(taskReferenceName) {
  return generateBoilerplateTask<HumanTaskConfig>(
    humanTaskSchema,
    taskReferenceName,
    {},
  );
}
