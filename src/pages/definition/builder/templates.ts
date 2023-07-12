import {
  DoWhileTaskConfig,
  DynamicForkTaskConfig,
  ForkTaskConfig,
  HttpTaskConfig,
  InlineTaskConfig,
  JQTransformTaskConfig,
  JoinTaskConfig,
  SimpleTaskConfig,
  SubworkflowTaskConfig,
  SwitchTaskConfig,
  TaskConfig,
  TaskConfigType,
  TerminateTaskConfig,
  WaitTaskConfig,
} from "../../../types/workflowDef";

export const templates: {
  [key in TaskConfigType]: (ref: string) => TaskConfig[];
} = {
  SIMPLE: (ref) => {
    const retval: SimpleTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "SIMPLE",
      name: ref,
    };
    return [retval];
  },
  SWITCH: (ref) => {
    const retval: SwitchTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "SWITCH",
      name: ref,
      defaultCase: [],
      evaluatorType: "",
      expression: "",
      decisionCases: {},
    };
    return [retval];
  },
  FORK_JOIN: (ref) => {
    const fork: ForkTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "FORK_JOIN",
      name: ref,
      forkTasks: [],
    };

    const join: JoinTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref + "_join",
      type: "JOIN",
      name: ref + "_join",
      joinOn: [],
    };
    return [fork, join];
  },
  FORK_JOIN_DYNAMIC: (ref) => {
    const fork: DynamicForkTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "FORK_JOIN_DYNAMIC",
      name: ref,
      dynamicForkTasksParam: "",
    };

    const join: JoinTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref + "_join",
      type: "JOIN",
      name: ref + "_join",
      joinOn: [],
    };
    return [fork, join];
  },
  DO_WHILE: (ref) => {
    const retval: DoWhileTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "DO_WHILE",
      name: ref,
      loopOver: [],
      loopCondition: `if($.${ref}['iteration'] < 3`,
    };
    return [retval];
  },
  HTTP: (ref: string) => {
    const retval: HttpTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "HTTP",
      name: ref,
    };
    return [retval];
  },
  SUB_WORKFLOW: (ref) => {
    const retval: SubworkflowTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "SUB_WORKFLOW",
      name: ref,
      subWorkflowParam: {},
    };
    return [retval];
  },
  TERMINATE: (ref: string) => {
    const retval: TerminateTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "TERMINATE",
      name: ref,
    };
    return [retval];
  },
  JQ_TRANSFORM: (ref) => {
    const retval: JQTransformTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      type: "JQ_TRANSFORM",
      name: ref,
    };
    return [retval];
  },
  INLINE: (ref) => {
    const retval: InlineTaskConfig = {
      inputParameters: {
        evaluatorType: "javascript",
        expression:
          "function scriptFun(){if ($.val){ return $.val + 1; } else { return 0; }} scriptFun()",
      },
      taskReferenceName: ref,
      type: "INLINE",
      name: ref,
    };
    return [retval];
  },
  WAIT: (ref) => {
    const retval: WaitTaskConfig = {
      inputParameters: {},
      taskReferenceName: ref,
      name: ref,
      type: "WAIT",
    };
    return [retval];
  },
  DECISION: (ref) => [],
  JOIN: (ref) => [],
  EXCLUSIVE_JOIN: (ref) => [],
};
