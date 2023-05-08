/* Utils to build workflow executions for the purpose of UI Component testing */
import {
  Execution,
  DynamicForkTaskConfig,
  WorkflowDef,
  ExecutionStatus,
  SimpleTaskConfig,
  JoinTaskConfig,
  ForkTaskConfig,
  TaskStatus,
  TaskConfigType,
  TaskConfig,
  DoWhileTaskConfig,
  SwitchTaskConfig,
  GenericTaskConfig,
} from "../../types/workflowDef";
import {
  BaseTaskResult,
  TaskResult,
  DynamicForkTaskResult,
} from "../../types/execution";
import { v4 as uuidv4 } from "uuid";
import { ExecutionAndTasks } from "../../data/execution";

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
        taskId: uuidv4(),
        taskType: "SIMPLE",
        referenceTaskName: ref,
        taskDefName: ref,
        status: status,
      } as BaseTaskResult);
    }

    this.workflowDefinition.tasks.push({
      taskReferenceName: ref,
      name: ref + "_name",
      type: "SIMPLE",
    } as SimpleTaskConfig);
  }

  pushTask(
    ref: string,
    type: TaskConfigType,
    additionalFields: any,
    status: TaskStatus = "COMPLETED"
  ) {
    this.tasks.push({
      taskId: uuidv4(),
      taskType:
        type === "FORK_JOIN" || type === "FORK_JOIN_DYNAMIC" ? "FORK" : type,
      referenceTaskName: ref,
      taskDefName: ref + "_name",
      status: status,
    });

    this.workflowDefinition.tasks.push({
      taskReferenceName: ref,
      name: ref + "_name",
      type: type,
      ...additionalFields,
    } as TaskConfig);
  }

  pushDynamicFork(
    ref: string,
    count: number,
    idxToFail?: number,
    status: TaskStatus = "COMPLETED"
  ) {
    const dfResult: DynamicForkTaskResult = {
      taskId: uuidv4(),
      taskType: "FORK",
      referenceTaskName: ref,
      taskDefName: ref,
      status,
      forkedTaskRefs: new Set(),
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
        taskId: uuidv4(),
        taskType: "SIMPLE",
        referenceTaskName: ref + "_child_" + i,
        taskDefName: ref + "_child",
        status: i === idxToFail ? "FAILED" : status,
        parentTaskReferenceName: ref,
      });
    }

    this.tasks.push({
      taskId: uuidv4(),
      taskType: "JOIN",
      referenceTaskName: ref + "_join",
      taskDefName: ref + "_join",
      status: !idxToFail ? status : "FAILED",
    });
  }

  pushDoWhile(ref: string, chainLength: number, count: number) {
    this.tasks.push({
      taskId: uuidv4(),
      taskType: "DO_WHILE",
      referenceTaskName: ref,
      taskDefName: ref + "_name",
      status: "COMPLETED",
    } as BaseTaskResult);

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < chainLength; j++) {
        const childRef = `${ref}_child${j}__${i}`;
        this.tasks.push({
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: childRef,
          taskDefName: `${ref}_child${j}_name`,
          status: "COMPLETED",
          iteration: i,
        });
      }
    }

    // Build loopOver
    const loopOver = [];
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
      loopOver: loopOver as SimpleTaskConfig[],
      type: "DO_WHILE",
    };

    this.workflowDefinition.tasks.push(doWhileTaskConfig);
  }

  pushSwitch(
    ref: string,
    cases: number,
    chainLength: number,
    caseTaken?: number
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
      taskId: uuidv4(),
      taskType: "SWITCH",
      referenceTaskName: ref,
      taskDefName: ref + "_name",
      status: "COMPLETED",
    });

    if (caseTaken !== undefined) {
      for (let j = 0; j < chainLength; j++) {
        this.tasks.push({
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: `case${caseTaken}_${j}`,
          taskDefName: `case${caseTaken}_${j}_name`,
          status: "COMPLETED",
        });
      }
    } else {
      for (let j = 0; j < chainLength; j++) {
        this.tasks.push({
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: `default_${j}`,
          taskDefName: `default_${j}_name`,
          status: "COMPLETED",
        });
      }
    }
  }
}
