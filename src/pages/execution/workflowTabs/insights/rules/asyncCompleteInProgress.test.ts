import WorkflowDAG from "../../../../../data/dag/WorkflowDAG";
import { ExecutionAndTasks } from "../../../../../types/execution";
import { asyncCompleteInProgress } from "./asyncCompleteInProgress";
import assert from "assert";

const activatesRule: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "test_workflow",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [
        {
          name: "async_http",
          taskReferenceName: "async_http",
          inputParameters: {
            http_request: "${workflow.input.http_request}"
          },
          type: "HTTP",
          asyncComplete: true,
        }
      ],
      name: "test_workflow",
      version: 1,
    },
  },
  tasks: [
    {
      taskType: "HTTP",
      status: "IN_PROGRESS",
      referenceTaskName: "async_http",
      taskDefName: "async_http",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
    },
  ],
};


const wrongStatus: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "test_workflow",
    status: "COMPLETED",
    workflowDefinition: {
      tasks: [
        {
          name: "async_http",
          taskReferenceName: "async_http",
          inputParameters: {
            http_request: "${workflow.input.http_request}"
          },
          type: "HTTP",
          asyncComplete: true,
        }
      ],
      name: "test_workflow",
      version: 1,
    },
  },
  tasks: [
    {
      taskType: "HTTP",
      status: "COMPLETED",
      referenceTaskName: "async_http",
      taskDefName: "async_http",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
    },
  ],
};

const asyncCompleteFalse: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "test_workflow",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [
        {
          name: "async_http",
          taskReferenceName: "async_http",
          inputParameters: {
            http_request: "${workflow.input.http_request}"
          },
          type: "HTTP",
          asyncComplete: false,
        }
      ],
      name: "test_workflow",
      version: 1,
    },
  },
  tasks: [
    {
      taskType: "HTTP",
      status: "IN_PROGRESS",
      referenceTaskName: "async_http",
      taskDefName: "async_http",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
    },
  ],
};



describe("Check asyncComplete rule", () => {
  describe("Task that activates rule", () => {
    it("Should return an alert", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(activatesRule);
      const alerts = asyncCompleteInProgress(activatesRule, dag);
      assert(alerts.length > 0);
    });
  });

  describe("Task that does not activate rule because of status", () => {
    it("Should return empty array", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(wrongStatus);
      const alerts = asyncCompleteInProgress(wrongStatus, dag);
      assert(alerts.length === 0);
    });
  });



  describe("Task that does not activate rule because taskConfig has asyncComplete=false", () => {
    it("Should return empty array", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(asyncCompleteFalse);
      const alerts = asyncCompleteInProgress(asyncCompleteFalse, dag);
      assert(alerts.length === 0);
    });

  });


});
