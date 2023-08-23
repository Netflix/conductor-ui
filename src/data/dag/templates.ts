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
} from "../../types/workflowDef";
import { createSimpleTaskParams } from "../../schema/task/simpleTask";
import { createInlineTaskParams } from "../../schema/task/inlineTask";
import { createHttpTaskParams } from "../../schema/task/httpTask";
import { createTerminateTaskParams } from "../../schema/task/terminateTask";
export const templates: {
  [key in TaskConfigType]: (ref: string) => TaskConfig[];
} = {
  SIMPLE: (ref) => {
    const retval: SimpleTaskConfig = createSimpleTaskParams(ref);
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
    const retval: HttpTaskConfig = createHttpTaskParams(ref);
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
    const retval: TerminateTaskConfig = createTerminateTaskParams(ref);
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
    const retval: InlineTaskConfig = createInlineTaskParams(ref);
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
