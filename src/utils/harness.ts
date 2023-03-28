/* Utils to build workflow executions for the purpose of UI Component testing */
import { Execution, BaseTaskResult, DynamicForkTaskConfig, TaskResult, WorkflowDef, ExecutionStatus, SimpleTaskConfig, DynamicForkTaskResult, JoinTaskConfig, ForkTaskConfig, TaskStatus, TaskType, TaskConfig } from "../components/diagram/WorkflowDAG";
import { v4 as uuidv4 } from "uuid";
import { ExecutionAndTasks } from "../data/execution";

export class WorkflowExecution implements Execution {
    workflowId: string;
    workflowName: string;
    tasks: TaskResult[] = [];
    status;
    workflowDefinition: WorkflowDef;

    parentWorkflowId = undefined;
    reasonForIncompletion= undefined;

    constructor(workflowName: string, status: ExecutionStatus){
        this.workflowId=uuidv4();
        this.workflowName=workflowName;
        this.status=status;
        this.workflowDefinition = {
          tasks: []
        }
    }

    toJSON(): ExecutionAndTasks {
      return {
        execution: {
          workflowId: this.workflowId,
          workflowName: this.workflowName,
          status: this.status,
          workflowDefinition: this.workflowDefinition,
          parentWorkflowId: this.parentWorkflowId,
          reasonForIncompletion: this.reasonForIncompletion
        }, 
        tasks: this.tasks
      }
    }

    pushSimple(ref: string, status: TaskStatus ="COMPLETED", tries = 1){
      for(let i=0;i< tries;i++){
        this.tasks.push({
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: ref,
          taskDefName: ref,
          status: status
        } as BaseTaskResult);
      }

      this.workflowDefinition.tasks.push({
        taskReferenceName: ref,
        type: "SIMPLE"
      } as SimpleTaskConfig);
    }

    pushTask(ref: string, type: TaskType, additionalFields: any, status: TaskStatus ="COMPLETED"){
      this.tasks.push({
        taskId: uuidv4(),
        taskType: (type === "FORK_JOIN" || type === "FORK_JOIN_DYNAMIC") ? "FORK": type,
        referenceTaskName: ref,
        taskDefName: ref,
        status: status,
      });


      this.workflowDefinition.tasks.push({
        taskReferenceName: ref,
        type: type,
        ...additionalFields
      } as TaskConfig);

    }

    pushStaticFork(ref: string, forks: number, chainLength: 1, status: TaskStatus ="COMPLETED"){
      this.tasks.push({
        taskId: uuidv4(),
        taskType: "FORK",
        referenceTaskName: ref,
        taskDefName: ref,
        status: status,
      } as BaseTaskResult);

      // Configs
      const joinOn=[];
      const forkTasks=[];
      for(let i=0;i<forks;i++){
        const chain = [];
        for(let j=0;j<chainLength;j++){
          const itemRef =  `${ref}_${i}_${j}`;
          chain.push({
            type: "SIMPLE",
            taskReferenceName: itemRef,
          } as SimpleTaskConfig);

          this.tasks.push({
            taskId: uuidv4(),
            taskType: "SIMPLE",
            referenceTaskName: itemRef,
            taskDefName: ref+"_child",
            status: status,
          })
          
          joinOn.push(itemRef);
        }
        forkTasks.push(chain);
      }

      this.workflowDefinition.tasks.push({
        taskReferenceName: ref,
        type: "FORK_JOIN",
        forkTasks: forkTasks
      } as ForkTaskConfig);

      this.workflowDefinition.tasks.push({
        taskReferenceName: ref+"_join",
        type: "JOIN",
        joinOn: joinOn
      } as JoinTaskConfig);

      // Push JOIN result
      this.tasks.push({
        taskId: uuidv4(),
        taskType: "JOIN",
        taskDefName: ref+"_join",
        referenceTaskName: ref+"_join",
        status: status
      })
    }

    pushDynamicFork(ref: string, count: number, idxToFail?: number){
      this.tasks.push({
        taskId: uuidv4(),
        taskType: "FORK",
        referenceTaskName: ref,
        taskDefName: ref,
        status: "COMPLETED",
        forkedTaskRefs: new Set()
      } as DynamicForkTaskResult);

      this.workflowDefinition.tasks.push({
        taskReferenceName: ref,
        type: "FORK_JOIN_DYNAMIC",
        dynamicForkTasksParam: "dynamicTasks"
      } as DynamicForkTaskConfig);

      this.workflowDefinition.tasks.push({
        taskReferenceName: ref+"_join",
        type: "JOIN"
      } as JoinTaskConfig);

      for(let i=0;i<count;i++){
        this.tasks.push({
          taskId: uuidv4(),
          taskType: "SIMPLE",
          referenceTaskName: ref+"_child_"+i,
          taskDefName: ref,
          status: i === idxToFail? "FAILED": "COMPLETED",
          parentTaskReferenceName: ref
        } as BaseTaskResult);
      }

      this.tasks.push({
        taskId: uuidv4(),
        taskType: "JOIN",
        referenceTaskName: ref+"_join",
        taskDefName: ref+"_join",
        status: !idxToFail?  "COMPLETED": "FAILED"
      } as BaseTaskResult)
    }
}

