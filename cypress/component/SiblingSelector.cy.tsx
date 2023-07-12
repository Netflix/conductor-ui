import WorkflowDAG from "../../src/components/diagram/WorkflowDAG";
import { WorkflowExecution } from "../../src/utils/test/mockWorkflow";
import SiblingSelector from "../../src/pages/execution/taskTabs/SiblingSelector";
import ThemeProvider from "../../src/theme/ThemeProvider";
import { CssBaseline } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { TaskCoordinate } from "../../src/types/workflowDef";
describe("No Retries", () => {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSimple("simple_task", "COMPLETED", 1);
  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());

  const taskSelection: TaskCoordinate = {
    id: workflow.tasks[0].taskId,
  };

  it("Module should be blank", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={taskSelection}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});

describe("No Selection", () => {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSimple("simple_task", "COMPLETED", 1);
  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());

  it("Module should be blank", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={undefined}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});

describe("Retries Only", () => {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushSimple("simple_task", "COMPLETED", 3);
  workflow.tasks[0].status = "FAILED";
  workflow.tasks[0].retryCount = 0;
  workflow.tasks[0].retried = true;
  workflow.tasks[1].status = "FAILED";
  workflow.tasks[1].retried = true;
  workflow.tasks[1].retryCount = 1;
  workflow.tasks[2].retryCount = 2;
  workflow.tasks[2].retried = true;

  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
  const taskSelection: TaskCoordinate = {
    id: workflow.tasks[0].taskId,
  };

  it("Displays selected task", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={taskSelection}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});

describe("Iterations Only", () => {
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDoWhile("loop_task", 1, 3);

  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
  const taskSelection: TaskCoordinate = {
    id: workflow.tasks[1].taskId,
  };

  it("Displays selected task", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={taskSelection}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});

describe("Iterations and Retries", () => {
  const ITERATIONS = 3;
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDoWhile("loop_task", 2, ITERATIONS);

  // Duplicate last task
  const taskToRetry = workflow.tasks.find(
    (task) =>
      task.referenceTaskName === `loop_task_child1` &&
      task.iteration === ITERATIONS - 1,
  );

  workflow.tasks.push({
    ...taskToRetry,
    taskId: uuidv4(),
    retried: true,
    retryCount: 1,
  });

  taskToRetry.status = "FAILED";
  taskToRetry.retried = true;

  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());
  const taskSelection: TaskCoordinate = {
    id: taskToRetry.taskId,
  };

  it("Displays selected task", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={taskSelection}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});

describe("Dynamic Fork all successes", () => {
  const FANOUT = 3;
  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDynamicFork("dynamic_fork", FANOUT);

  const { execution } = workflow.toJSON();
  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());

  const taskSelection: TaskCoordinate = {
    id: workflow.tasks[1].taskId,
  };

  it("Displays selected task", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={taskSelection}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});

describe("Dynamic Fork with Retries", () => {
  const FANOUT = 3;

  const workflow = new WorkflowExecution("test_workflow", "COMPLETED");
  workflow.pushDynamicFork("dynamic_fork", FANOUT);

  // Append extra retry to one of the forked tasks
  const taskToRetry = workflow.tasks[FANOUT];
  taskToRetry.status = "FAILED";
  taskToRetry.retried = true;
  workflow.tasks.splice(FANOUT + 1, 0, {
    ...taskToRetry,
    taskId: uuidv4(),
    status: "COMPLETED",
    retryCount: 1,
  });

  const { execution } = workflow.toJSON();
  const dag = WorkflowDAG.fromExecutionAndTasks(workflow.toJSON());

  const taskSelection: TaskCoordinate = {
    id: workflow.tasks[FANOUT].taskId,
  };

  it("Displays selected task", () => {
    cy.mount(
      <ThemeProvider>
        <CssBaseline />
        <SiblingSelector
          dag={dag}
          selectedTask={taskSelection}
          onTaskChange={() => console.log("change")}
        />
      </ThemeProvider>,
    );
  });
});
