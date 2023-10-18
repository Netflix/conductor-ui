import WorkflowDAG from "../../../../../data/dag/WorkflowDAG";
import { ExecutionAndTasks } from "../../../../../types/execution";
import { checkPollCountAndCallBackAfterSeconds } from "./checkPollCountAndCallbackAfterSeconds";
import assert from "assert";

const validObjectWithPollCountThree: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [],
      name: "placeholder",
      version: 3,
    },
  },
  tasks: [
    {
      taskType: "SIMPLE",
      status: "SCHEDULED",
      referenceTaskName: "crayon_process_splits_task",
      retryCount: 0,
      pollCount: 3,
      taskDefName: "crayon_process_splits_task",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      retried: false,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
      callbackAfterSeconds: 0,
      workerId: "f05ed059-16b5-4c8a-b720-01b937193f67",
    },
  ],
};

const validObjectWithPollCountThreeCbas: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [],
      name: "placeholder",
      version: 3,
    },
  },
  tasks: [
    {
      taskType: "SIMPLE",
      status: "SCHEDULED",
      referenceTaskName: "crayon_process_splits_task",
      retryCount: 0,
      pollCount: 3,
      taskDefName: "crayon_process_splits_task",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      retried: false,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
      callbackAfterSeconds: 3,
      workerId: "f05ed059-16b5-4c8a-b720-01b937193f67",
    },
  ],
};

const validObjectWithPollCount1: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [],
      name: "placeholder",
      version: 3,
    },
  },
  tasks: [
    {
      taskType: "SIMPLE",
      status: "SCHEDULED",
      referenceTaskName: "crayon_process_splits_task",
      retryCount: 0,
      pollCount: 1,
      taskDefName: "crayon_process_splits_task",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      retried: false,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
      callbackAfterSeconds: 3,
      workerId: "f05ed059-16b5-4c8a-b720-01b937193f67",
    },
  ],
};

const validObjectNotScheduled: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [],
      name: "placeholder",
      version: 3,
    },
  },
  tasks: [
    {
      taskType: "SIMPLE",
      status: "COMPLETED",
      referenceTaskName: "crayon_process_splits_task",
      retryCount: 0,
      pollCount: 3,
      taskDefName: "crayon_process_splits_task",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      updateTime: 1690912791005,
      retried: false,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
      callbackAfterSeconds: 3,
      workerId: "f05ed059-16b5-4c8a-b720-01b937193f67",
    },
  ],
};

const invalidObjectsMissingFields: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [],
      name: "placeholder",
      version: 3,
    },
  },
  tasks: [
    {
      taskType: "SIMPLE",
      status: "SCHEDULED",
      referenceTaskName: "crayon_process_splits_task",
      retryCount: 0,
      taskDefName: "crayon_process_splits_task",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      retried: false,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
      workerId: "f05ed059-16b5-4c8a-b720-01b937193f67",
    },
  ],
};

describe("Check Poll Count rule", () => {
  describe("Task that activates rule", () => {
    describe("Task that activates rule", () => {
      it("Should return an alert without cbas clause", () => {
        const dag = WorkflowDAG.fromExecutionAndTasks(
          validObjectWithPollCountThree,
        );
        const alerts = checkPollCountAndCallBackAfterSeconds(
          validObjectWithPollCountThree,
          dag,
        );
        assert.equal(1, alerts.length);
        assert.equal(
          'Task "crayon_process_splits_task" was picked up by worker f05ed059-16b5-4c8a-b720-01b937193f67 but returned to Conductor for delayed processing.',
          alerts[0].component,
        );
      });
    });

    it("Should return an alert with cbas clause", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(
        validObjectWithPollCountThreeCbas,
      );
      const alerts = checkPollCountAndCallBackAfterSeconds(
        validObjectWithPollCountThreeCbas,
        dag,
      );
      assert.equal(1, alerts.length);
      assert.equal(
        'Task "crayon_process_splits_task" was picked up by worker f05ed059-16b5-4c8a-b720-01b937193f67 but returned to Conductor for delayed processing. Because callBackAfterSeconds was set to 3 seconds by the worker, Conductor will not reschedule the task until that time has passed. This condition has occured 3 times. If this is the intended behavior, then no action is necessary.',
        alerts[0].component,
      );
    });
  });

  describe("Task that should not trigger an alert because pollCount is too small", () => {
    it("Should return empty array", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(validObjectWithPollCount1);
      const alerts = checkPollCountAndCallBackAfterSeconds(
        validObjectWithPollCount1,
        dag,
      );
      assert.equal(0, alerts.length);
    });
  });

  describe("Task that should not trigger an alert because status is not SCHEDULED", () => {
    it("Should return empty array", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(validObjectNotScheduled);
      const alerts = checkPollCountAndCallBackAfterSeconds(
        validObjectNotScheduled,
        dag,
      );
      assert.equal(0, alerts.length);
    });
  });

  describe("Task missing needed fields", () => {
    it("Should return empty array and not crash", () => {
      const dag = WorkflowDAG.fromExecutionAndTasks(
        invalidObjectsMissingFields,
      );
      const alerts = checkPollCountAndCallBackAfterSeconds(
        invalidObjectsMissingFields,
        dag,
      );
      assert.equal(0, alerts.length);
    });
  });
});
