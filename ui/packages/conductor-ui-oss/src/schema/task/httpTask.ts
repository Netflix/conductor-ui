import { HttpTaskConfig } from "../../types/workflowDef";
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
    type: "select",
    options: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    key: "accept",
    defaultValue: "application/json",
    required: false,
    type: "select",
    options: ["text/plain", "text/html", "application/json"],
  },
  {
    key: "contentType",
    defaultValue: "application/json",
    required: false,
    type: "select",
    options: ["text/plain", "text/html", "application/json"],
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
  return generateBoilerplateTask<HttpTaskConfig>(
    httpTaskLevelParameters,
    taskReferenceName,
    {
      inputParameters: {
        http_request: {
          ...generateBoilerplate(httpRequestParameters),
          headers: [],
        },
      },
    },
  );
}
