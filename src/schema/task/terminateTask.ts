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
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
]);

export const terminateInputParametersSchema = [
  {
    key: "terminationStatus",
    defaultValue: "COMPLETED",
    required: true,
    type: "string" as SchemaType,
    visible: true,
  },
  {
    key: "terminationReason",
    defaultValue: "",
    required: false,
    type: "string" as SchemaType,
    visible: true,
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
