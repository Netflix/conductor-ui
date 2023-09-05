import { SwitchTaskConfig } from "../../types/workflowDef";

export const SwitchTaskSchema = [
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
    key: "evaluatorType",
    default: "javascript",
    required: true,
    type: "string",
  },
];

export function createNewSwitchTask(taskReferenceName) {
  let taskConfig = {};

  SwitchTaskSchema.forEach((parameter) => {
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
  taskConfig["type"] = "SWITCH";
  taskConfig["inputParameters"] = {};
  taskConfig["evaluatorType"] = "javascript";
  taskConfig["expression"] = "";
  taskConfig["decisionCases"] = {};
  taskConfig["defaultCase"] = [];

  return taskConfig as SwitchTaskConfig;
}
