import { DynamicTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const dynamicTaskSchema = extendSchema(
  "DYNAMIC",
  ["name", "taskReferenceName", "optional"],
  [
    {
      key: "dynamicTaskNameParam",
      defaultValue: "",
      required: true,
      type: "string",
    },
  ],
);

export function createDynamicTask(taskReferenceName) {
  return generateBoilerplateTask<DynamicTaskConfig>(
    dynamicTaskSchema,
    taskReferenceName,
    {
      dynamicTaskNameParam: "taskToExecute",
      inputParameters: {
        taskToExecute: "",
      },
    },
  );
}
