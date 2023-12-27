import { InlineTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const inlineTaskSchema = extendSchema("INLINE", [
  "name",
  "taskReferenceName",
  "description",
]);

export const inlineInputParamsSchema = [
  {
    key: "evaluatorType",
    defaultValue: "javascript",
    required: true,
    type: "string",
  },
  {
    key: "expression",
    defaultValue: "",
    required: true,
    type: "string",
  },
];

export function createNewInlineTask(taskReferenceName) {
  return generateBoilerplateTask<InlineTaskConfig>(
    inlineTaskSchema,
    taskReferenceName,
    {
      inputParameters: {
        evaluatorType: "javascript",
        expression: "",
      },
    },
  );
}
