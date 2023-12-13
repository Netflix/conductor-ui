import { SetVariableTaskConfig } from "../../types/workflowDef";
import { extendSchema, generateBoilerplateTask } from "../schemaUtils";

export const setVariableSchema = extendSchema("SET_VARIABLE", [
  "name",
  "taskReferenceName",
  "description",
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
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
