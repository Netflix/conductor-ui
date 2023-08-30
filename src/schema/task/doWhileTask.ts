import { DoWhileTaskConfig } from "../../types/workflowDef";

export const doWhileTaskSchema = [
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
    key: "startDelay",
    default: 0,
    required: false,
    type: "int",
  },
  {
    key: "rateLimited",
    default: false,
    required: false,
    type: "boolean",
  },
  {
    key: "retryCount",
    default: 0,
    required: false,
    type: "int",
  },
];

export function createDoWhileTaskParams(taskReferenceName) {
  let taskParams = {};

  doWhileTaskSchema.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskParams[parameter.key] = taskReferenceName;
      } else {
        taskParams[parameter.key] = parameter.default;
      }
    }
  });
  taskParams["type"] = "DO_WHILE";
  taskParams["loopCondition"] = "";
  taskParams["loopOver"] = [];
  taskParams["inputParameters"] = {};

  return taskParams as DoWhileTaskConfig;
}
