import { TerminateTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

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
    type: "string",
  },
  {
    key: "terminationReason",
    defaultValue: "",
    required: false,
    type: "string",
  },
  {
    key: "workflowOutput",
    defaultValue: undefined,
    required: false,
    type: "object",
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
