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
  const dag = WorkflowDAG.fromExecutionAndTasks({
    execution: forklifterWf,
    tasks: forklifterTasks,
  });

  it("Shows one spawned task individually.", () => {
    cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);

    it("Child displayed explicitly", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#forklift_and_ks_publish_workflow_0").should(
        "have.class",
        "status_COMPLETED",
      );
    });
  });
});
