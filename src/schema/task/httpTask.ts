import { HttpTaskConfig } from "../../types/workflowDef";

export const httpTaskLevelParameters = [
  {
    id: 0,
    key: "name",
    value: "",
    changed: false,
    required: true,
    type: "string",
    level: "task",
  },
  {
    id: 1,
    key: "taskReferenceName",
    value: "",
    changed: false,
    required: true,
    level: "task",
  },
  {
    id: 2,
    key: "description",
    value: "",
    changed: false,
    required: false,
    type: "string",
    level: "task",
  },
  {
    id: 3,
    key: "optional",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
    level: "task",
  },
  {
    id: 4,
    key: "asyncComplete",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
    level: "task",
  },
  {
    id: 5,
    key: "startDelay",
    value: 0,
    changed: false,
    required: false,
    type: "int",
    level: "task",
  },
  {
    id: 6,
    key: "rateLimited",
    value: false,
    changed: false,
    required: false,
    type: "boolean",
    level: "task",
  },
  {
    id: 7,
    key: "retryCount",
    value: 0,
    changed: false,
    required: false,
    type: "int",
    level: "task",
  },
  {
    id: 8,
    key: "asyncCompleteExpression",
    value: "false",
    changed: false,
    required: false,
    type: "string",
    level: "inputParameters",
  },
];

export const httpRequestParameters = [
  {
    id: 0,
    key: "uri",
    value: "https://datausa.io/api/data?drilldowns=Nation&measures=Population",
    changed: false,
    required: true,
    type: "string",
    level: "http_request",
  },
  {
    id: 1,
    key: "method",
    value: "GET",
    changed: false,
    required: true,
    type: "string",
    level: "http_request",
  },
  {
    id: 2,
    key: "accept",
    value: "application/json",
    changed: false,
    required: false,
    type: "string",
    level: "http_request",
  },
  {
    id: 3,
    key: "contentType",
    value: "application/json",
    changed: false,
    required: false,
    type: "string",
    level: "http_request",
  },
  {
    id: 4,
    key: "vipAddress",
    value: "",
    changed: false,
    required: false,
    type: "string",
    level: "http_request",
  },
  {
    id: 5,
    key: "appName",
    value: "",
    changed: false,
    required: false,
    type: "string",
    level: "http_request",
  },
];

export function createHttpTaskParams(taskReferenceName) {
  let taskParams = {};
  let httpRequest = {};

  httpTaskLevelParameters.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      // Sets the value as the respective input if the key matches "name" or "taskReferenceName", otherwise, uses the default value
      if (parameter.key === "name") {
        taskParams[parameter.key] = taskReferenceName;
      } else if (parameter.key === "taskReferenceName") {
        taskParams[parameter.key] = taskReferenceName;
      } else {
        taskParams[parameter.key] = parameter.value;
      }
    }
  });

  httpRequestParameters.forEach((parameter) => {
    // Only expose fields that are marked as required
    if (parameter.required === true) {
      httpRequest[parameter.key] = parameter.value;
    }
  });

  taskParams["type"] = "HTTP";
  taskParams["inputParameters"] = { http_request: {} };
  taskParams["inputParameters"]["http_request"] = JSON.parse(
    JSON.stringify(httpRequest),
  );

  return taskParams as HttpTaskConfig;
}
