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
    visible: true,
  },
  {
    key: "version",
    defaultValue: "",
    required: false,
    type: "number" as SchemaType,
    visible: true,
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
