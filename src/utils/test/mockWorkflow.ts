/* Utils to build workflow executions for the purpose of UI Component testing */
import {
  DynamicForkTaskConfig,
  WorkflowDef,
  SimpleTaskConfig,
  JoinTaskConfig,
  TaskConfigType,
  DoWhileTaskConfig,
  SwitchTaskConfig,
  GenericTaskConfig,
} from "../../types/workflowDef";
import {
  TaskResult,
  ForkTaskResult,
  Execution,
  ExecutionStatus,
  ExecutionAndTasks,
  TaskStatus,
} from "../../types/execution";
import { v4 as uuidv4 } from "uuid";

const emptyTask = {
  taskId: null,
  taskType: null,
  referenceTaskName: null,
  taskDefName: null,
  status: "COMPLETED",
  workflowInstanceId: null,
  startTime: 0,
  endTime: 0,
  aliasForRef: "",
  reasonForIncompletion: "",
  workerId: "",
  subWorkflowId: "",
  retried: false,
};

export class WorkflowExecution implements Execution {
  workflowId: string;
  workflowName: string;
  tasks: TaskResult[] = [];
  status;
  workflowDefinition: WorkflowDef;

  parentWorkflowId = undefined;
  reasonForIncompletion = undefined;

  constructor(workflowName: string, status: ExecutionStatus) {
    this.workflowId = uuidv4();
    this.workflowName = workflowName;
    this.status = status;
    this.workflowDefinition = {
      name: workflowName,
      version: 1,
      tasks: [],
    };
  }

  toJSON(): ExecutionAndTasks {
    return {
      execution: {
        workflowId: this.workflowId,
        workflowName: this.workflowName,
        status: this.status,
        workflowDefinition: this.workflowDefinition,
        parentWorkflowId: this.parentWorkflowId,
        reasonForIncompletion: this.reasonForIncompletion,
      },
      tasks: this.tasks,
    };
  }

  pushSimple(ref: string, status: TaskStatus = "COMPLETED", tries = 1) {
    for (let i = 0; i < tries; i++) {
      this.tasks.push({
        ...emptyTask,
        taskId: uuidv4(),
        taskType: "SIMPLE",
        referenceTaskName: ref,
        taskDefName: ref,
        status: status,
        workflowInstanceId: this.workflowId,
      });
    }

    this.workflowDefinition.tasks.push({
      taskReferenceName: ref,
      name: ref + "_name",
      type: "SIMPLE",
    });
  }

  pushTask(
    ref: string,
    type: TaskConfigType,
    additionalFields: any,
    status: TaskStatus = "COMPLETED",
  ) {
    this.tasks.push({
      ...emptyTask,
      taskId: uuidv4(),
      taskType:
        type === "FORK_JOIN" || type === "FORK_JOIN_DYNAMIC" ? "FORK" : type,
      referenceTaskName: ref,
      taskDefName: ref + "_name",
      status: status,
      workflowInstanceId: this.workflowId,
    });

    this.workflowDefinition.tasks.push({
      taskReferenceName: ref,
      name: ref + "_name",
      type: type,
      ...additionalFields,
    });
  }

  pushDynamicFork(
    ref: string,
    count: number,
    idxToFail?: number,
    status: TaskStatus = "COMPLETED",
  ) {
    const dfResult: ForkTaskResult = {
      ...emptyTask,
      taskId: uuidv4(),
      taskType: "FORK",
      referenceTaskName: ref,
      taskDefName: ref,
      status,
      workflowInstanceId: this.workflowId,
    };
    this.tasks.push(dfResult);

    const dfTaskConfig: DynamicForkTaskConfig = {
      taskReferenceName: ref,
      name: ref + "_name",
      type: "FORK_JOIN_DYNAMIC",
      dynamicForkTasksParam: "dynamicTasks",
    };
    this.workflowDefinition.tasks.push(dfTaskConfig);

    const joinTaskConfig: JoinTaskConfig = {
      name: ref + "_join_name",
      taskReferenceName: ref + "_join",
      type: "JOIN",
    };
    this.workflowDefinition.tasks.push(joinTaskConfig);

    for (let i = 0; i < count; i++) {
      this.tasks.push({
        ...emptyTask,
        taskId: uuidv4(),
        taskType: "SIMPLE",
        referenceTaskName: ref + "_child_" + i,
        taskDefName: ref + "_child",
        status: i === idxToFail ? "FAILED" : status,
        parentTaskReferenceName: ref,
        workflowInstanceId: this.workflowId,
      });
    }

    this.tasks.push({
      ...emptyTask,
      taskId: uuidv4(),
      taskType: "JOIN",
      referenceTaskName: ref + "_join",
      taskDefName: ref + "_join",
      status: !idxToFail ? status : "FAILED",
      workflowInstanceId: this.workflowId,
    });
  }

  pushDoWhile(ref: string, chainLength: number, count: number) {
    this.tasks.push({
      ...emptyTask,
      taskId: uuidv4(),
      taskType: "DO_WHILE",
      referenceTaskName: ref,
      taskDefName: ref + "_name",
      status: "COMPLETED",
      workflowInstanceId: this.workflowId,
    });

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < chainLength; j++) {
        const childRef = `${ref}_child${j}`;
        this.tasks.push({
          ...emptyTask,
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: childRef,
          taskDefName: `${ref}_child${j}_name`,
          status: "COMPLETED",
          iteration: i,
          workflowInstanceId: this.workflowId,
        });
      }
    }

    // Build loopOver
    const loopOver: SimpleTaskConfig[] = [];
    for (let j = 0; j < chainLength; j++) {
      loopOver.push({
        taskReferenceName: `${ref}_child${j}`,
        type: "SIMPLE",
        name: `${ref}_child${j}_name`,
      });
    }

    const doWhileTaskConfig: DoWhileTaskConfig = {
      taskReferenceName: ref,
      name: ref + "_name",
      loopOver: loopOver,
      loopCondition: "false",
      type: "DO_WHILE",
    };

    this.workflowDefinition.tasks.push(doWhileTaskConfig);
  }

  pushSwitch(
    ref: string,
    cases: number,
    chainLength: number,
    caseTaken?: number,
  ) {
    const defaultCase: SimpleTaskConfig[] = [];
    for (let j = 0; j < chainLength; j++) {
      defaultCase.push({
        type: "SIMPLE",
        taskReferenceName: `default_${j}`,
        name: `default_${j}_name`,
      });
    }

    const decisionCases: { [key: string]: GenericTaskConfig[] } = {};
    for (let i = 0; i < cases; i++) {
      const chain: SimpleTaskConfig[] = [];
      for (let j = 0; j < chainLength; j++) {
        chain.push({
          type: "SIMPLE",
          taskReferenceName: `case${i}_${j}`,
          name: `case${i}_${j}_name`,
        });
      }

      decisionCases[`case_${i}`] = chain;
    }

    const switchTaskConfig: SwitchTaskConfig = {
      evaluatorType: "value-param",
      expression: "switchCaseValue",
      taskReferenceName: ref,
      name: ref + "_name",
      defaultCase,
      decisionCases,
      type: "SWITCH",
    };

    this.workflowDefinition.tasks.push(switchTaskConfig);

    // Push execution
    this.tasks.push({
      ...emptyTask,
      taskId: uuidv4(),
      taskType: "SWITCH",
      referenceTaskName: ref,
      taskDefName: ref + "_name",
      status: "COMPLETED",
      workflowInstanceId: this.workflowId,
    });

    if (caseTaken !== undefined) {
      for (let j = 0; j < chainLength; j++) {
        this.tasks.push({
          ...emptyTask,
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: `case${caseTaken}_${j}`,
          taskDefName: `case${caseTaken}_${j}_name`,
          status: "COMPLETED",
          workflowInstanceId: this.workflowId,
          parentTaskReferenceName: j === 0 ? ref : undefined,
        });
      }
    } else {
      for (let j = 0; j < chainLength; j++) {
        this.tasks.push({
          ...emptyTask,
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: `default_${j}`,
          taskDefName: `default_${j}_name`,
          status: "COMPLETED",
          workflowInstanceId: this.workflowId,
          parentTaskReferenceName: j === 0 ? ref : undefined,
        });
      }
    }
  }
}
