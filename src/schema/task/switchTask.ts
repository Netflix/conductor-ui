import { SwitchTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const SwitchTaskSchema = extendSchema(
  "SWITCH",
  ["name", "taskReferenceName", "description", "optional"],
  [
    {
      key: "evaluatorType",
      defaultValue: "value-param",
      required: true,
      type: "string",
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
