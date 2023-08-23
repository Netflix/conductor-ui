import { InlineTaskConfig } from "../../types/workflowDef";

export const inlineTaskParameters = [
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
    key: "startDelay",
    value: 0,
    changed: false,
    required: false,
    type: "int",
  },
  {
    id: 5,
    key: "rateLimited",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
  },
  {
    id: 6,
    key: "retryCount",
    value: 0,
    changed: false,
    required: false,
    type: "int",
  },
  {
    id: 7,
    key: "evaluatorType",
    value: "javascript",
    changed: false,
    required: true,
    type: "string",
  },
];

export function createInlineTaskParams(taskReferenceName) {
  let taskParams = {};
  let inputParameters = {};

  taskParams["type"] = "INLINE";

  inlineTaskParameters.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "evaluatorType") {
        inputParameters[parameter.key] = parameter.value;
      } else {
        taskParams[parameter.key] = parameter.value;
      }
    }
  });
  inputParameters["expression"] =
    "function scriptFun(){if ($.val){ return $.val + 1; } else { return 0; }} scriptFun()";
  taskParams["inputParameters"] = inputParameters;

  return taskParams as InlineTaskConfig;
}
