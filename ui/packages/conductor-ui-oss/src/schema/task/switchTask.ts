import { SwitchTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const SwitchTaskSchema = extendSchema(
  "SWITCH",
  ["name", "taskReferenceName", "description"],
  [
    {
      key: "evaluatorType",
      defaultValue: "value-param",
      required: true,
      type: "select",
      options: ["value-param", "javascript"],
    },
  ],
);

export function createNewSwitchTask(taskReferenceName) {
  return generateBoilerplateTask<SwitchTaskConfig>(
    SwitchTaskSchema,
    taskReferenceName,
    {
      inputParameters: {
        caseValue: "",
      },
      expression: "caseValue",
      decisionCases: {},
      defaultCase: [],
    },
  );
}
