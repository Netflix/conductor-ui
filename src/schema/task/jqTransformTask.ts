import { JQTransformTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const jqTransformTaskSchema = extendSchema("SET_VARIABLE", [
  "name",
  "taskReferenceName",
  "description",
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
]);

export function createNewJqTransformTask(taskReferenceName) {
  return generateBoilerplateTask<JQTransformTaskConfig>(
    jqTransformTaskSchema,
    taskReferenceName,
    {
      inputParameters: {
        key1: "foobar",
        queryExpression: "{ output: .key1 }",
      },
    },
  );
}
