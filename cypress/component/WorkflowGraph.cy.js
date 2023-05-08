import WorkflowDAG from "../../src/components/diagram/WorkflowDAG";
import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import React from "react";

import forklifterWf from "../fixtures/forklifter/workflow.json";
import forklifterTasks from "../fixtures/forklifter/tasks.json";

describe("Dag is undefined", () => {
  it("Renders an empty canvas with a null dag", () => {
    cy.mount(<WorkflowGraph dag={undefined} executionMode={false} />);
  });
});

describe("forklifter", () => {
  it("Renders a canvas with a forklifter dag", () => {

    const dag = WorkflowDAG.fromExecutionAndTasks({
      execution: forklifterWf,
      tasks: forklifterTasks
    })
    
    cy.mount(
      <WorkflowGraph dag={dag} executionMode={true} />
    );
    cy.get("#dynamic_tasks_DF_TASK_PLACEHOLDER")
      .should("contain", "3 of 3 tasks succeeded")
      .click();

    cy.get("@onClickSpy").should("be.calledWith", { ref: "first_task" });
  });
});
