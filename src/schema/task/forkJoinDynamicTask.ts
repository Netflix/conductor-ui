import { DynamicForkTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const forkJoinDynamicTaskSchema = extendSchema(
  "FORK_JOIN_DYNAMIC",
  ["name", "taskReferenceName", "description", "optional"],
  [
    {
      key: "dynamicForkTasksParam",
      defaultValue: "",
      required: true,
      type: "string",
    },
    {
      key: "dynamicForkTasksInputParamName",
      defaultValue: "",
      required: true,
      type: "string",
    },
  ],
);

export function createNewForkJoinDynamicTask(taskReferenceName) {
  return generateBoilerplateTask<DynamicForkTaskConfig>(
    forkJoinDynamicTaskSchema,
    taskReferenceName,
    {
      dynamicForkTasksParam: "dynamicTasks",
      dynamicForkTasksInputParamName: "dynamicTasksInput",
      inputParameters: {
        dynamicTasks: "",
        dynamicTasksInput: "",
      },
    },
  );
}
