import { SetVariableTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const setVariableSchema = extendSchema("SET_VARIABLE", [
  "name",
  "taskReferenceName",
  "description",
]);

export function createNewSetVariableTask(taskReferenceName) {
  return generateBoilerplateTask<SetVariableTaskConfig>(
    setVariableSchema,
    taskReferenceName,
    {
      inputParameters: {
        myvar: "foobar",
      },
    },
  );
}
