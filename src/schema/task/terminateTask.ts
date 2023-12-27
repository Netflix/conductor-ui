import { TerminateTaskConfig } from "../../types/workflowDef";
import {
  SchemaType,
  extendSchema,
  generateBoilerplateTask,
} from "../schemaUtils";

export const terminateTaskSchema = extendSchema("TERMINATE", [
  "name",
  "taskReferenceName",
  "description",
]);

export const terminateInputParametersSchema = [
  {
    key: "terminationStatus",
    defaultValue: "COMPLETED",
    required: true,
    type: "select" as SchemaType,
    options: ["COMPLETED", "FAILED"],
  },
  {
    key: "terminationReason",
    defaultValue: "",
    required: false,
    type: "string" as SchemaType,
  },
];

export function createNewTerminateTask(taskReferenceName) {
  return generateBoilerplateTask<TerminateTaskConfig>(
    terminateTaskSchema,
    taskReferenceName,
    {
      inputParameters: {
        terminationStatus: "COMPLETED",
      },
    },
  );
}
