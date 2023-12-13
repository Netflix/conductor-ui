import { StartWorkflowTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const startWorkflowSchema = extendSchema("START_WORKFLOW", [
  "name",
  "taskReferenceName",
  "description",
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
]);

export function createNewStartWorkflowTask(taskReferenceName) {
  return generateBoilerplateTask<StartWorkflowTaskConfig>(
    startWorkflowSchema,
    taskReferenceName,
    {
      inputParameters: {
        startWorkflow: {
          name: "my_workflow",
        },
      },
    },
  );
}
