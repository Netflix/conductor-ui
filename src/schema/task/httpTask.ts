import {
  InterimSchemaField,
  extendSchema,
  generateBoilerplate,
  generateBoilerplateTask,
} from "../schemaUtils";

export type DataSourceType = "string" | "boolean" | "number";

export type DataSourceEntry = {
  key: string;
  type: string;
  required: boolean;
  defaultValue: any;
  value: any;
};

export const httpTaskLevelParameters: InterimSchemaField[] = extendSchema(
  "HTTP",
  [
    "name",
    "taskReferenceName",
    "description",
    "rateLimited",
    "retryCount",
    "startDelay",
    "optional",
    "asyncComplete",
  ],
);

export const httpRequestParameters: InterimSchemaField[] = [
  {
    key: "uri",
    defaultValue: "",
    placeholderValue:
      "https://datausa.io/api/data?drilldowns=Nation&measures=Population",
    required: true,
    type: "string",
  },
  {
    key: "method",
    defaultValue: "",
    placeholderValue: "GET",
    required: true,
    type: "string",
  },
  {
    key: "accept",
    defaultValue: "application/json",
    required: false,
    type: "string",
  },
  {
    key: "contentType",
    defaultValue: "application/json",
    required: false,
    type: "string",
  },
  {
    key: "vipAddress",
    defaultValue: "",
    required: false,
    type: "string",
  },
  {
    key: "appName",
    defaultValue: "",
    required: false,
    type: "string",
  },
];

export function createNewHttpTask(taskReferenceName: string) {
  return generateBoilerplateTask(httpTaskLevelParameters, taskReferenceName, {
    inputParameters: {
      http_request: {
        ...generateBoilerplate(httpRequestParameters),
        headers: [],
      },
    },
  });
}
