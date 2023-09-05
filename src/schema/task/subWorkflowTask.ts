import { SubworkflowTaskConfig } from "../../types/workflowDef";

export const subWorkflowTaskSchema = [
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
    key: "retryCount",
    default: 0,
    required: false,
    type: "int",
  },
  {
    key: "subWorkflowParam.name",
    default: "",
    required: true,
    type: "string",
  },
  {
    key: "subWorkflowParam.version",
    default: 0,
    required: true,
    type: "int",
  },
];

export function createNewSubWorkflowTask(taskReferenceName) {
  let taskConfig = {};
  let subWorkflowParam = {};

  subWorkflowTaskSchema.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskConfig[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskConfig[parameter.key] = taskReferenceName;
      } else if (parameter.key === "subWorkflowParam.name") {
        subWorkflowParam["name"] = parameter.default;
      } else if (parameter.key === "subWorkflowParam.version") {
        subWorkflowParam["version"] = parameter.default;
      } else {
        taskConfig[parameter.key] = parameter.default;
      }
    }
  });
  taskConfig["type"] = "SUB_WORKFLOW";
  taskConfig["inputParameters"] = {};
  taskConfig["subWorkflowParam"] = subWorkflowParam;

  return taskConfig as SubworkflowTaskConfig;
}
