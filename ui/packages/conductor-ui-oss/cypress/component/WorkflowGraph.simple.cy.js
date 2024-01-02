import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import {
  dagSimpleSuccess,
  dagSimpleUnexecuted,
  dagSimpleFailure,
  dagSimpleRetries,
  dagSimpleDefOnly,
} from "../../src/utils/test/dagSimple";
import React from "react";

describe("Simple Task", () => {
  describe("Success", () => {
    const dag = dagSimpleSuccess();

    it("has ref", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("contain.text", "simple_task");
    });

    it("has name in parentheses", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("contain.text", "(simple_task_name)");
    });

    it("is COMPLETED and colored green", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("have.class", "status_COMPLETED");
      cy.get("#simple_task rect").should(
        "have.css",
        "fill",
        "rgb(174, 225, 184)",
      );
    });

    it("start and final not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("not.have.class", "dimmed");
    });

    it("No dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
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

      cy.get("#simple_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "simple_task",
      });
    });

    it("Captures background click", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get(".graphSvg").click();
      cy.get("@onClickSpy").should("have.been.calledWith", null);
    });

    it("displays selection", () => {
      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          selectedTask={{ ref: "simple_task" }}
        />,
      );

      cy.get("#simple_task").should("have.class", "selected");
    });
  });

  describe("Unexecuted", () => {
    const dag = dagSimpleUnexecuted();
    it("has ref", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("contain.text", "simple_task");
    });

    it("has name", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("contain.text", "(simple_task_name)");
    });

    it("start not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
    });

    it("simple_task is unexecuted (dimmed)", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("have.class", "dimmed");
    });

    it("2 dimmed edge", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 2);
    });

    it("end is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__final").should("have.class", "dimmed");
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

      cy.get("#simple_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "simple_task",
      });
    });
  });

  describe("Defintion Only", () => {
    const dag = dagSimpleDefOnly();

    it("start not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#__start").should("not.have.class", "dimmed");
    });

    it("simple_task not dimmed and not colored", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#simple_task").should("not.have.class", "dimmed");
      cy.get("#simple_task").should("not.have.class", "status_COMPLETED");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });

    it("end not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#__final").should("not.have.class", "dimmed");
    });

    it("handles click", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={false}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#simple_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "simple_task",
      });
    });
  });

  describe("Failure", () => {
    const dag = dagSimpleFailure();
    it("is FAILED (red)", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("have.class", "status_FAILED");
    });

    it("start is not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("not.have.class", "dimmed");
    });

    it("final is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("not.class", "dimmed");
    });

    it("one path is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 1);
    });
  });

  describe("Retries", () => {
    const dag = dagSimpleRetries();
    it("is COMPLETED (green)", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("have.class", "status_COMPLETED");
    });

    it("label has number of attempts", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#simple_task").should("contain.text", "3 Attempts");
    });
  });
});
