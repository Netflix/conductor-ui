import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import React from "react";

describe("Dag is undefined", () => {
  it("Renders an empty canvas with a null dag", () => {
    cy.mount(<WorkflowGraph dag={undefined} executionMode={false} />);
  });
});
