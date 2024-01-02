import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import {
  dagStaticForkSuccess,
  dagStaticForkFailure,
  dagStaticForkRetries,
  dagStaticForkUnexecuted,
} from "../../src/utils/test/dagStaticFork";
import React from "react";

describe("Static Fork", () => {
  describe("Success", () => {
    const dag = dagStaticForkSuccess();

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_fork").should("have.class", "bar");
      cy.get("#static_fork").should("have.class", "type-FORK_JOIN");
      cy.get("#static_fork").should("have.class", "status_COMPLETED");
    });

    it("Top bar contains ref and name in parentheses", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_fork").should("contain.text", "static_fork");
      cy.get("#static_fork").should("contain.text", "(static_fork_name)");
    });

    it("Children COMPLETED and have ref and name", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      for (let i = 0; i < 4; i++) {
        cy.get(`#static_fork_task_${i}`).should(
          "have.class",
          "status_COMPLETED",
        );
        cy.get(`#static_fork_task_${i}`).should(
          "contain.text",
          `static_fork_task_${i}`,
        );
        cy.get(`#static_fork_task_${i}`).should(
          "contain.text",
          `(static_fork_task_${i}_name)`,
        );
      }
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_join").should("have.class", "bar");
      cy.get("#static_join").should("have.class", "type-JOIN");
      cy.get("#static_join").should("have.class", "status_COMPLETED");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });
  });

  describe("Failure", () => {
    const dag = dagStaticForkFailure();

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_fork").should("have.class", "bar");
      cy.get("#static_fork").should("have.class", "type-FORK_JOIN");
      cy.get("#static_fork").should("have.class", "status_COMPLETED");
    });

    it("One child is failed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(`#static_fork_task_2`).should("have.class", "status_FAILED");
    });

    it("One child is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(`#static_fork_task_3`).should("have.class", "dimmed");
    });

    it("JOIN bar is present and FAILED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_join").should("have.class", "bar");
      cy.get("#static_join").should("have.class", "type-JOIN");
      cy.get("#static_join").should("have.class", "status_FAILED");
    });

    it("start not dimmed but final is", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("have.class", "dimmed");
    });

    it("3 dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 3);
    });
  });

  describe("Unexecuted", () => {
    const dag = dagStaticForkUnexecuted();

    it("DF top bar is present and no status", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_fork").should("have.class", "bar");
      cy.get("#static_fork").should("have.class", "type-FORK_JOIN");
      cy.get("#static_fork").should("not.have.class", "status_COMPLETED");
      cy.get("#static_fork").should("have.class", "dimmed");
    });

    it("Children have ref and name and dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      for (let i = 0; i < 4; i++) {
        cy.get(`#static_fork_task_${i}`).should(
          "not.have.class",
          "status_COMPLETED",
        );

        cy.get(`#static_fork_task_${i}`).should(
          "not.have.class",
          "status_COMPLETED",
        );
      }
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_join").should("have.class", "bar");
      cy.get("#static_join").should("have.class", "type-JOIN");
      cy.get("#static_join").should("not.have.class", "status_COMPLETED");
    });

    it("8 dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 8);
    });
  });

  describe("Definition Only", () => {
    const dag = dagStaticForkUnexecuted();

    it("DF top bar is present and no status", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#static_fork").should("have.class", "bar");
      cy.get("#static_fork").should("have.class", "type-FORK_JOIN");
      cy.get("#static_fork").should("not.have.class", "status_COMPLETED");
    });

    it("Top bar contains ref and name in parentheses", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#static_fork").should("contain.text", "static_fork");
      cy.get("#static_fork").should("contain.text", "(static_fork_name)");
    });

    it("Children have ref and name and not executed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      for (let i = 0; i < 4; i++) {
        cy.get(`#static_fork_task_${i}`).should(
          "not.have.class",
          "status_COMPLETED",
        );
        cy.get(`#static_fork_task_${i}`).should(
          "contain.text",
          `static_fork_task_${i}`,
        );
        cy.get(`#static_fork_task_${i}`).should(
          "contain.text",
          `(static_fork_task_${i}_name)`,
        );
      }
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#static_join").should("have.class", "bar");
      cy.get("#static_join").should("have.class", "type-JOIN");
      cy.get("#static_join").should("not.have.class", "status_COMPLETED");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });
  });

  describe("Failure", () => {
    const dag = dagStaticForkFailure();

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_fork").should("have.class", "bar");
      cy.get("#static_fork").should("have.class", "type-FORK_JOIN");
      cy.get("#static_fork").should("have.class", "status_COMPLETED");
    });

    it("One child is failed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(`#static_fork_task_2`).should("have.class", "status_FAILED");
    });

    it("One child is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(`#static_fork_task_3`).should("have.class", "dimmed");
    });

    it("JOIN bar is present and FAILED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_join").should("have.class", "bar");
      cy.get("#static_join").should("have.class", "type-JOIN");
      cy.get("#static_join").should("have.class", "status_FAILED");
    });

    it("start not dimmed but final is", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("have.class", "dimmed");
    });

    it("3 dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 3);
    });
  });

  describe("Retries", () => {
    const dag = dagStaticForkRetries();

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_fork").should("have.class", "bar");
      cy.get("#static_fork").should("have.class", "type-FORK_JOIN");
      cy.get("#static_fork").should("have.class", "status_COMPLETED");
    });

    it("Retried task still COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(`#static_fork_task_3`).should("have.class", "status_COMPLETED");
    });

    it("Retried task counts attempts", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(`#static_fork_task_3`).should("contain.text", "2 Attempts");
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#static_join").should("have.class", "bar");
      cy.get("#static_join").should("have.class", "type-JOIN");
      cy.get("#static_join").should("have.class", "status_COMPLETED");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });
  });
});
