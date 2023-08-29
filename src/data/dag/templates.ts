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
import { createNewSimpleTask } from "../../schema/task/simpleTask";
import { createInlineTaskParams } from "../../schema/task/inlineTask";
import { createHttpTaskParams } from "../../schema/task/httpTask";
import { createTerminateTaskParams } from "../../schema/task/terminateTask";
import { createWaitTaskParams } from "../../schema/task/waitTask";
import { createJQTransformTaskParams } from "../../schema/task/JQTransformTask";
import { createDoWhileTaskParams } from "../../schema/task/doWhileTask";
export const templates: {
  [key in TaskConfigType]: (ref: string) => TaskConfig[];
} = {
  SIMPLE: (ref) => {
    const retval: SimpleTaskConfig = createNewSimpleTask(ref);
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
    const retval: DoWhileTaskConfig = createDoWhileTaskParams(ref);
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
  JSON_JQ_TRANSFORM: (ref) => {
    const retval: JQTransformTaskConfig = createJQTransformTaskParams(ref);
    return [retval];
  },
  INLINE: (ref) => {
    const retval: InlineTaskConfig = createInlineTaskParams(ref);
    return [retval];
  },
  WAIT: (ref) => {
    const retval: WaitTaskConfig = createWaitTaskParams(ref);
    return [retval];
  },
  DECISION: (ref) => [],
  JOIN: (ref) => [],
  EXCLUSIVE_JOIN: (ref) => [],
};
