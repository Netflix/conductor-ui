import { DynamicForkTaskConfig } from "../../types/workflowDef";

export const forkJoinDynamicTaskSchema = [
  {
    key: "name",
    default: "",
    required: true,
    type: "string",
  },
  {
    key: "taskReferenceName",
    default: "",
    required: true,
    type: "string",
  },
  {
    key: "description",
    default: "",
    required: false,
    type: "string",
  },
  {
    key: "optional",
    default: false,
    required: false,
    type: "boolean",
  },
  {
    key: "dynamicForkTasksParam",
    default: "",
    required: true,
    type: "string",
  },
  {
    key: "dynamicForkTasksInputParamName",
    default: "",
    required: true,
    type: "string",
  },
];

export function createNewForkJoinDynamicTask(taskReferenceName) {
  let taskConfig = {};

  forkJoinDynamicTaskSchema.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskConfig[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskConfig[parameter.key] = taskReferenceName;
      } else {
        taskConfig[parameter.key] = parameter.default;
      }
    }
  });
  taskConfig["type"] = "FORK_JOIN_DYNAMIC";
  taskConfig["inputParameters"] = {};
  taskConfig["dynamicForkTasksParam"] = "";
  taskConfig["dynamicForkTasksInputParamName"] = "";

  return taskConfig as DynamicForkTaskConfig;
}