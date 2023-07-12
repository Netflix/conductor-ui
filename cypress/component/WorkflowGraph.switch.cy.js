import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import {
  dagSwitchDefOnly,
  dagSwitchSuccess,
  dagSwitchUnexecuted,
  dagSwitchDoWhileDefOnly,
  dagSwitchDefaultCaseNoTaskNotTaken,
  dagSwitchDefaultCaseNoTaskTaken,
} from "../../src/utils/test/dagSwitch";
import React from "react";

describe("Switch", () => {
  describe("Success - Default", () => {
    const dag = dagSwitchSuccess();

    it("Switch Diamond is present and is COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#switch_task").should("have.class", "type-SWITCH");
      cy.get("#switch_task").should("have.class", "status_COMPLETED");
      cy.get("#switch_task polygon").should("exist");
    });

    it("Switch Diamond contains ref", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#switch_task").should("contain.text", "switch_task");
    });

    it("6 dimmed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 6);
    });

    it("4 executed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.executed").should("have.length", 4);
    });

    it("active label colored blue", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgeLabel text").should("have.css", "fill", "rgb(0, 0, 255)");
    });

    it("Only default tasks are completed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#default_0").should("have.class", "status_COMPLETED");
      cy.get("#default_1").should("have.class", "status_COMPLETED");
      cy.get("#case0_0")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
      cy.get("#case0_1")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
      cy.get("#case1_0")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
      cy.get("#case1_1")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
    });

    it("handles click", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#switch_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "switch_task",
      });
    });
  });

  describe("Success - Case 0", () => {
    const dag = dagSwitchSuccess(0);

    it("6 dimmed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 6);
    });

    it("4 executed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.executed").should("have.length", 4);
    });

    it("active label colored blue", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgeLabel text").should("have.css", "fill", "rgb(0, 0, 255)");
    });

    it("Only case 0 tasks are completed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#default_0")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
      cy.get("#default_1")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
      cy.get("#case0_0").should("have.class", "status_COMPLETED");
      cy.get("#case0_1").should("have.class", "status_COMPLETED");
      cy.get("#case1_0")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
      cy.get("#case1_1")
        .should("not.have.class", "status_COMPLETED")
        .should("have.class", "dimmed");
    });
  });

  describe("Definition Only", () => {
    const dag = dagSwitchDefOnly();

    it("no dimmed or executed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
      cy.get(".edgePath.executed").should("have.length", 0);
    });

    it("No dimmed or executed tasks", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".node.status_COMPLETED").should("have.length", 0);
      cy.get(".node.dimmed").should("have.length", 0);
    });

    it("handles click", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#switch_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "switch_task",
      });
    });
  });

  describe("Unexecuted", () => {
    const dag = dagSwitchUnexecuted();

    it("All paths dimmed and unexecuted", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 10);
      cy.get(".edgePath.executed").should("have.length", 0);
    });

    it("All tasks dimmed and unexecuted (except start)", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".node.dimmed").should("have.length", 8);
      cy.get(".node.status_COMPLETED").should("have.length", 0);
    });

    it("No blue text", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgeLabel text").should(
        "not.have.css",
        "fill",
        "rgb(0, 0, 255)",
      );
    });

    it("handles click", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#switch_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "switch_task",
      });
    });
  });

  describe("Switch at bottom of Do-While", () => {
    const dag = dagSwitchDoWhileDefOnly();

    it("top bar widened to span children", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#do_while rect")
        .should("have.css", "width")
        .then((val) => parseFloat(val.replace(/[^.\d]/g, "")))
        .should("be.greaterThan", 300);
    });

    it("Expect 13 edges (incl. cosmetic loop arrow)", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".edgePath").should("have.length", 13);
    });
  });

  /*
  describe("Switch at bottom of Do-While - Executed", () => {
    const dag = dagSwitchDoWhileSuccess();

    // TODO Verify how many tasks should be collapsed.
    it("Placeholder has correct count", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#do_while_LOOP_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "1 of 1 tasks succeeded"
      );
    });
  });
*/

  describe("Switch - Empty default case - chosen", () => {
    const dag = dagSwitchDefaultCaseNoTaskTaken();

    it("2 dimmed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 2);
    });

    it("2 executed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.executed").should("have.length", 2);
    });
  });

  describe("Switch - Empty default case - skipped ", () => {
    const dag = dagSwitchDefaultCaseNoTaskNotTaken();

    it("1 dimmed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 1);
    });

    it("3 executed paths", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.executed").should("have.length", 3);
    });
  });
});
