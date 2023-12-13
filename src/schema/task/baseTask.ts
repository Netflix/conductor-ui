import { InterimSchemaField } from "../schemaUtils";

export const baseTaskSchema: InterimSchemaField[] = [
  {
    key: "name",
    defaultValue: "",
    required: true,
    type: "string",
  },
  {
    key: "taskReferenceName",
    defaultValue: "",
    required: true,
    type: "string",
  },
  {
    key: "description",
    defaultValue: "",
    required: false,
    type: "string",
  },
  {
    key: "rateLimited",
    defaultValue: false,
    required: false,
    type: "boolean",
  },
  {
    key: "retryCount",
    defaultValue: 0,
    required: false,
    type: "number",
  },
  {
    key: "startDelay",
    defaultValue: 0,
    required: false,
    type: "number",
    alwaysInclude: true,
  },
  {
    key: "optional",
    defaultValue: false,
    required: false,
    type: "boolean",
    alwaysInclude: true,
  },
  {
    key: "asyncComplete",
    defaultValue: false,
    required: false,
    type: "boolean",
    alwaysInclude: true,
  },
];
