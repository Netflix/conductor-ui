import { InlineTaskConfig } from "../../types/workflowDef";

export const inlineTaskSchema = [
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
  {
    key: "evaluatorType",
    default: "javascript",
    required: true,
    type: "string",
  },
];

export function createNewInlineTask(taskReferenceName) {
  let taskParams = {};
  let inputParameters = {};

  taskParams["type"] = "INLINE";

  inlineTaskSchema.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "evaluatorType") {
        inputParameters[parameter.key] = parameter.default;
      } else {
        taskParams[parameter.key] = parameter.default;
      }
    }
  });
  inputParameters["expression"] =
    "function scriptFun(){if ($.val){ return $.val + 1; } else { return 0; }} scriptFun()";
  taskParams["inputParameters"] = inputParameters;

  return taskParams as InlineTaskConfig;
}
