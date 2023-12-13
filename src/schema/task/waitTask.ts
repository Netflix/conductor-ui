import { WaitTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const waitTaskSchema = extendSchema("WAIT", [
  "name",
  "taskReferenceName",
  "description",
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
]);

export function createNewWaitTask(taskReferenceName) {
  return generateBoilerplateTask<WaitTaskConfig>(
    waitTaskSchema,
    taskReferenceName,
    {
      inputParameters: {
        duration: "1m",
      },
    },
  );
}
