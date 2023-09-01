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
import { createNewForkJoinTask } from "../../schema/task/forkJoinTask";
import { createNewForkJoinDynamicTask } from "../../schema/task/forkJoinDynamicTask";
import { createNewSwitchTask } from "../../schema/task/switchTask";
export const templates: {
  [key in TaskConfigType]: (ref: string) => TaskConfig[];
} = {
  SIMPLE: (ref) => {
    const retval: SimpleTaskConfig = createNewSimpleTask(ref);
    return [retval];
  },
  SWITCH: (ref) => {
    const retval: SwitchTaskConfig = createNewSwitchTask(ref);
    return [retval];
  },
  FORK_JOIN: (ref) => {
    const fork: ForkTaskConfig = createNewForkJoinTask(ref);

    const join: JoinTaskConfig = createNewJoinTask(ref + "_join");
    return [fork, join];
  },
  FORK_JOIN_DYNAMIC: (ref) => {
    const fork: DynamicForkTaskConfig = createNewForkJoinDynamicTask(ref);

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
