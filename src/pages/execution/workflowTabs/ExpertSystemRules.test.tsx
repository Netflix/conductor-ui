import { ExecutionAndTasks } from "../../../types/execution";
import { checkPollCountAndCallBackAfterSeconds } from "./ExpertSystemRules";
import assert from "assert";

const validObjectWithPollCountThree: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [
        {
          taskReferenceName: "",
          type: "TERMINATE",
          name: "placeholder",
        },
      ],
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
      iteration: 0,
      aliasForRef: "placeholder",
      reasonForIncompletion: "placeholder",
      subWorkflowId: "placeholder",
    },
  ],
};

const validObjectWithPollCount1: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [
        {
          taskReferenceName: "",
          type: "TERMINATE",
          name: "placeholder",
        },
      ],
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
      iteration: 0,
      aliasForRef: "placeholder",
      reasonForIncompletion: "placeholder",
      subWorkflowId: "placeholder",
    },
  ],
};

const invalidObjectsMissingFields: ExecutionAndTasks = {
  execution: {
    workflowId: "32cea27e-5441-4536-93b0-51f0c0b79976",
    workflowName: "Crayon",
    status: "IN_PROGRESS",
    workflowDefinition: {
      tasks: [
        {
          taskReferenceName: "",
          type: "TERMINATE",
          name: "placeholder",
        },
      ],
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
      taskDefName: "crayon_process_splits_task",
      scheduledTime: 1690912790524,
      startTime: 1690912791005,
      endTime: 1690912791092,
      retried: false,
      workflowInstanceId: "32cea27e-5441-4536-93b0-51f0c0b79976",
      taskId: "35c223c0-3095-11ee-ba4d-a76c0d097d90",
      workerId: "f05ed059-16b5-4c8a-b720-01b937193f67",
      iteration: 0,
      aliasForRef: "placeholder",
      reasonForIncompletion: "placeholder",
      subWorkflowId: "placeholder",
    },
  ],
};

describe("Check Poll Count rule", () => {
  describe("Task that activates rule", () => {
    it("Should return an alert", () => {
      const rules = checkPollCountAndCallBackAfterSeconds(
        validObjectWithPollCountThree,
      );
      assert(rules.length > 0);
    });
  });

  describe("Check Poll Count rule", () => {
    describe("Task that should not trigger an alert", () => {
      it("Should return empty array", () => {
        const rules = checkPollCountAndCallBackAfterSeconds(
          validObjectWithPollCount1,
        );
        assert(rules.length === 0);
      });
    });
  });

  describe("Task missing needed fields", () => {
    it("Should return empty array and not crash", () => {
      const rules = checkPollCountAndCallBackAfterSeconds(
        invalidObjectsMissingFields,
      );
      assert(rules.length === 0);
    });
  });
});
