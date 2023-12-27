import { JQTransformTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const jqTransformTaskSchema = extendSchema("JSON_JQ_TRANSFORM", [
  "name",
  "taskReferenceName",
  "description",
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
