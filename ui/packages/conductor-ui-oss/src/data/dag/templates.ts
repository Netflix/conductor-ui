import {
  DoWhileTaskConfig,
  DynamicForkTaskConfig,
  DynamicTaskConfig,
  ForkTaskConfig,
  HttpTaskConfig,
  HumanTaskConfig,
  InlineTaskConfig,
  JQTransformTaskConfig,
  JoinTaskConfig,
  SetVariableTaskConfig,
  SimpleTaskConfig,
  StartWorkflowTaskConfig,
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
import { createNewJqTransformTask } from "../../schema/task/transformTask";
import { createNewDoWhileTask } from "../../schema/task/doWhileTask";
import {
  createNewJoinTask,
  createNewJoinTaskForDynamicFork,
} from "../../schema/task/joinTask";
import { createNewForkJoinTask } from "../../schema/task/forkJoinTask";
import { createNewForkJoinDynamicTask } from "../../schema/task/forkJoinDynamicTask";
import { createNewSwitchTask } from "../../schema/task/switchTask";
import { createNewSubWorkflowTask } from "../../schema/task/subWorkflowTask";
import { createDynamicTask } from "../../schema/task/dynamicTask";
import { createNewHumanTask } from "../../schema/task/humanTask";
import { createNewStartWorkflowTask } from "../../schema/task/startWorkflowTask";
import { createNewSetVariableTask } from "../../schema/task/setVariableTask";
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
  DYNAMIC: (ref) => {
    const retval: DynamicTaskConfig = createDynamicTask(ref);
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
    const retval: SubworkflowTaskConfig = createNewSubWorkflowTask(ref);
    return [retval];
  },
  TERMINATE: (ref: string) => {
    const retval: TerminateTaskConfig = createNewTerminateTask(ref);
    return [retval];
  },
  JSON_JQ_TRANSFORM: (ref) => {
    const retval: JQTransformTaskConfig = createNewJqTransformTask(ref);
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
  HUMAN: (ref) => {
    const retval: HumanTaskConfig = createNewHumanTask(ref);
    return [retval];
  },
  START_WORKFLOW: (ref) => {
    const retval: StartWorkflowTaskConfig = createNewStartWorkflowTask(ref);
    return [retval];
  },
  SET_VARIABLE: (ref) => {
    const retval: SetVariableTaskConfig = createNewSetVariableTask(ref);
    return [retval];
  },
  EVENT: (ref) => [],
  DECISION: (ref) => [],
  JOIN: (ref) => [],
  EXCLUSIVE_JOIN: (ref) => [],
};
