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
import { createNewInlineTask } from "../../schema/task/inlineTask";
import { createNewHttpTask } from "../../schema/task/httpTask";
import { createNewTerminateTask } from "../../schema/task/terminateTask";
import { createNewWaitTask } from "../../schema/task/waitTask";
import { createNewJQTransformTask } from "../../schema/task/JQTransformTask";
import { createNewDoWhileTask } from "../../schema/task/doWhileTask";
import {
  createNewJoinTask,
  createNewJoinTaskForDynamicFork,
} from "../../schema/task/joinTask";
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

    const join: JoinTaskConfig = createNewJoinTask(ref + "_join");
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

    const join: JoinTaskConfig = createNewJoinTaskForDynamicFork(ref + "_join");
    return [fork, join];
  },
  DO_WHILE: (ref) => {
    const retval: DoWhileTaskConfig = createNewDoWhileTask(ref);
    return [retval];
  },
  HTTP: (ref: string) => {
    const retval: HttpTaskConfig = createNewHttpTask(ref);
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
    const retval: TerminateTaskConfig = createNewTerminateTask(ref);
    return [retval];
  },
  JSON_JQ_TRANSFORM: (ref) => {
    const retval: JQTransformTaskConfig = createNewJQTransformTask(ref);
    return [retval];
  },
  INLINE: (ref) => {
    const retval: InlineTaskConfig = createNewInlineTask(ref);
    return [retval];
  },
  WAIT: (ref) => {
    const retval: WaitTaskConfig = createNewWaitTask(ref);
    return [retval];
  },
  DECISION: (ref) => [],
  JOIN: (ref) => [],
  EXCLUSIVE_JOIN: (ref) => [],
};
