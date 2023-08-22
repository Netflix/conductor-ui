import { SimpleTaskConfig } from "../../types/workflowDef";

export const simpleTaskParameters = [
  {
    id: 0,
    key: "name",
    value: "",
    changed: false,
    required: true,
    type: "string",
  },
  {
    id: 1,
    key: "taskReferenceName",
    value: "",
    changed: false,
    required: true,
  },
  {
    id: 2,
    key: "description",
    value: "",
    changed: false,
    required: false,
    type: "string",
  },
  {
    id: 3,
    key: "optional",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
  },
  {
    id: 4,
    key: "asyncComplete",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
  },
  {
    id: 5,
    key: "startDelay",
    value: 0,
    changed: false,
    required: false,
    type: "int",
  },
  {
    id: 6,
    key: "rateLimited",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
  },
  {
    id: 7,
    key: "retryCount",
    value: 0,
    changed: false,
    required: false,
    type: "int",
  },
];

export function createSimpleTaskParams(taskReferenceName) {
  let taskParams = {};

  simpleTaskParameters.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskParams[parameter.key] = taskReferenceName;
      } else {
        taskParams[parameter.key] = parameter.value;
      }
    }
  });
  taskParams["type"] = "SIMPLE";
  taskParams["inputParameters"] = {};

  return taskParams as SimpleTaskConfig;
}
