
  
 

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
      value: "",
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

  export const defaultSimpleTask =  {
    "inputParameters": {},
    "taskReferenceName": "simple_0",
    "type": "SIMPLE",
    "name": "simple_0"
  };

  export const defaultInlineTask =  {
    "inputParameters": {
      "evaluatorType": "javascript",
      "expression": "function scriptFun(){if ($.val){ return $.val + 1; } else { return 0; }} scriptFun()"
    },
    "taskReferenceName": "inline_0",
    "type": "INLINE",
    "name": "inline_0"
  };

  export const defaultHttpTask = {
    "inputParameters": {
        http_request: {
            uri: "https://jsonplaceholder.typicode.com/posts/",
            method: "POST",
          },
    },
    "taskReferenceName": "http_0",
    "type": "HTTP",
    "name": "http_0"
  };

 