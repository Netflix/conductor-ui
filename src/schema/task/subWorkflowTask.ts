import { SubworkflowTaskConfig } from "../../types/workflowDef";
import {
  SchemaType,
  extendSchema,
  generateBoilerplateTask,
} from "../schemaUtils";

export const subWorkflowTaskSchema = extendSchema("SUB_WORKFLOW", [
  "name",
  "taskReferenceName",
  "description",
  "rateLimited",
  "retryCount",
  "startDelay",
  "optional",
  "asyncComplete",
]);

export const subWorkflowParamSchema = [
  {
    key: "name",
    defaultValue: "",
    required: true,
    type: "string" as SchemaType,
  },
  {
    key: "version",
    defaultValue: "",
    required: false,
    type: "number" as SchemaType,
  },
];

export function createNewSubWorkflowTask(taskReferenceName) {
  return generateBoilerplateTask<SubworkflowTaskConfig>(
    subWorkflowTaskSchema,
    taskReferenceName,
    {
      subWorkflowParam: {
        name: "my_subworkflow_name",
      },
      inputParameters: {},
    },
  );
}
